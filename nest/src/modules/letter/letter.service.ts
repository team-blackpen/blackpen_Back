import { Injectable, BadRequestException } from '@nestjs/common';

import { PostService } from '@/modules/post/post.service';
import { AligoService } from '@/common/aligo/aligo.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as dayjs from 'dayjs';

import { CreateLetterDto } from './dto/create-letter.dto';

import { LetterListItem } from './interfaces/letter-list-item.interface';
import { LetterTmpListItem } from './interfaces/letter-tmp-list-item.interface';
import { LetterDetailItem } from './interfaces/letter-detail-item.interface';
import { Font } from './interfaces/letter-font.interface';
import { LetterTmp } from './interfaces/letter-tmp-item.interface';
import { LetterCheckResult } from './interfaces/letter-check.interface';
import {
  CreateNewLetterInput,
  UpdateLetterInput,
} from './interfaces/letter-write-param.interface';

@Injectable()
export class LetterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postService: PostService,
    private readonly aligoService: AligoService,
  ) {}

  async getLetterList(userNo: number): Promise<LetterListItem[]> {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const letterList = await this.getLetterListFromDB(userNo, now);
    const newLetterList = await this.getNewLetterList(userNo);

    const newLetterNos = newLetterList.map((item) => item.letter_no);

    for (const letter of letterList) {
      letter.new_letter = newLetterNos.includes(letter.letter_no) ? 1 : 0;
    }

    return letterList;
  }

  private async getLetterListFromDB(userNo: number, now: string) {
    const letterList: any[] = await this.prisma.$queryRaw`
      SELECT 
        L.letter_no, L.user_no, L.post_no, Li.sender, 
        IF(L.send_dt = '0000-00-00 00:00:00', NULL, L.send_dt) AS send_dt
      FROM tb_letter L
      JOIN tb_letter_info Li ON L.letter_no = Li.letter_no 
      WHERE L.recipient_user_no = ${userNo}
        AND L.status = 1
        AND L.send_dt <= ${now}
      ORDER BY L.send_dt DESC;
    `;

    for (const letter of letterList) {
      letter.img = await this.getLetterImages(letter.letter_no);
    }

    return letterList;
  }

  // 편지 이미지 조회
  private async getLetterImages(letterNo: number) {
    const img = await this.prisma.tb_letter_img.findMany({
      where: {
        letter_no: letterNo,
        status: 1,
      },
      select: {
        letter_img_no: true,
        letter_img_url: true,
      },
    });

    return img;
  }

  // 받은 편지 중 읽지 않은 편지 조회
  private async getNewLetterList(userNo: number) {
    const result: any[] = await this.prisma.$queryRaw`
      SELECT 
        L.letter_no
      FROM tb_letter L
      LEFT JOIN tb_letter_read_log Lrl ON L.letter_no = Lrl.letter_no AND Lrl.recipient_user_no = ${userNo}
      WHERE 
        L.status = 1 
        AND L.recipient_user_no = ${userNo}
        AND Lrl.letter_read_log_no IS NULL;
    `;

    return result;
  }

  // 임시 저장된 편지 조회
  async getLetterTmpList(userNo: number): Promise<LetterTmpListItem[]> {
    const yesterday = dayjs()
      .subtract(300, 'day')
      .format('YYYY-MM-DD HH:mm:ss');

    const letterTmpList: LetterTmpListItem[] = await this.prisma.$queryRaw`
      SELECT 
        L.letter_no, L.user_no, L.post_no,
        IF(L.upt_dt, L.upt_dt, L.reg_dt) AS upt_dt,
        Lc.letter_contents_no, Lc.letter_contents,
        Pi.post_img_no, Pi.img_url
      FROM tb_letter L
      JOIN tb_letter_contents Lc ON L.letter_no = Lc.letter_no AND Lc.status = 1
      JOIN tb_post_img Pi ON L.post_no = Pi.post_no AND Pi.view_seq = 0 AND Pi.status = 1
      WHERE 
        L.user_no = ${userNo}
        AND L.status = 0
        AND COALESCE(L.upt_dt, L.reg_dt) > ${yesterday}
      ORDER BY upt_dt DESC;
    `;

    return letterTmpList;
  }

  async getLetter(
    userNo: number,
    letterNo: number,
    hashLetter?: string,
  ): Promise<LetterDetailItem> {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const letter = await this.getLetterDetail(userNo, letterNo, hashLetter);

    if (!letter) throw new BadRequestException('조회할 편지가 없습니다');

    letter.img = await this.getLetterImages(letter.letter_no);
    letter.post_preview_img = await this.postService.getPostDetailEtc(
      letter.post_no,
      'postPreviewImg',
    );

    await this.saveLetterReadLog(letter, userNo, now);

    return letter;
  }

  private async getLetterDetail(
    userNo: number | undefined,
    letterNo?: number,
    hashLetter?: string,
  ): Promise<LetterDetailItem | null> {
    // 게스트 접근(해시) 또는 로그인 유저 접근(letter_no + user_no)
    const whereClause = hashLetter
      ? Prisma.sql`L.hash_no = ${hashLetter}`
      : Prisma.sql`L.letter_no = ${letterNo} AND L.recipient_user_no = ${userNo}`;

    const result: LetterDetailItem[] = await this.prisma.$queryRaw`
      SELECT 
        L.letter_no, L.user_no, L.post_no, L.recipient_user_no,
        Li.recipient, Li.sender, Up.user_img_url,
        Lc.letter_contents_no, Lc.letter_contents, P.post_description
      FROM tb_letter L
      JOIN tb_letter_info Li ON L.letter_no = Li.letter_no
      JOIN tb_letter_contents Lc ON L.letter_no = Lc.letter_no AND Lc.status = 1
      JOIN tb_user_profile Up ON L.user_no = Up.user_no
      JOIN tb_post P ON L.post_no = P.post_no
      WHERE 
        L.status = 1 AND ${whereClause};
    `;

    return result[0] ?? null;
  }

  // 수신 로그 생성
  private async saveLetterReadLog(
    letter: LetterDetailItem,
    userNo: number | undefined,
    now: string,
  ) {
    await this.prisma.tb_letter_read_log.create({
      data: {
        letter_no: letter.letter_no,
        user_no: userNo ?? 0,
        post_no: letter.post_no,
        recipient_user_no: letter.recipient_user_no,
        read_dt: new Date(now),
      },
    });
  }

  async getFont(
    limit: number,
    offset: number,
  ): Promise<{ font: Font[]; nextData: number }> {
    const font: Font[] = await this.prisma.$queryRaw`
      SELECT 
        font_no, font_title, font_url
      FROM tb_font
      WHERE 
        status = 1
      ORDER BY view_seq
      LIMIT ${limit} OFFSET ${offset};
    `;

    const nextOffset = offset + limit;

    const nextCheck: any[] = await this.prisma.$queryRaw`
      SELECT 
        font_no
      FROM tb_font
      WHERE 
        status = 1
      ORDER BY view_seq
      LIMIT ${limit} OFFSET ${nextOffset};
    `;

    return {
      font,
      nextData: nextCheck.length > 0 ? 1 : 0,
    };
  }

  async getLetterTmp(userNo: number, letterNo: number): Promise<LetterTmp> {
    const letterList: LetterTmp[] = await this.prisma.$queryRaw`
      SELECT 
        L.letter_no, L.user_no, L.post_no, L.status, L.stage,
        Lc.letter_contents_no, Lc.letter_contents,
        Li.font_no, F.font_title,
        Li.recipient, Li.recipient_phone,
        Li.sender, Li.sender_phone,
        Li.reservation_status, Li.reservation_dt
      FROM tb_letter L
      JOIN tb_letter_info Li ON L.letter_no = Li.letter_no
      JOIN tb_font F ON Li.font_no = F.font_no
      JOIN tb_letter_contents Lc ON L.letter_no = Lc.letter_no AND Lc.status = 1
      WHERE 
        L.letter_no = ${letterNo} 
        AND L.user_no = ${userNo} 
        AND L.status = 0;
    `;

    const letter = letterList[0];
    if (!letter)
      throw new BadRequestException('임시 저장된 편지를 찾을 수 없습니다');

    letter.img = await this.getLetterImages(letter.letter_no);

    return letter;
  }

  async postThankMsg(
    userNo: number,
    letterNo: number,
    thankMsg: number,
  ): Promise<void> {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const letterCheck: LetterCheckResult | null =
      await this.prisma.tb_letter.findFirst({
        where: {
          recipient_user_no: userNo,
          letter_no: letterNo,
          status: 1,
        },
        select: {
          user_no: true, // 보낸 사람
        },
      });

    if (!letterCheck) {
      throw new BadRequestException(
        '자신의 편지에만 감동메세지를 보낼 수 있습니다',
      );
    }

    const sendUser = letterCheck?.user_no;

    await this.saveThankMessage(userNo, letterNo, thankMsg, now);

    await this.increaseHeartTemper(userNo, 0.5);
    await this.increaseHeartTemper(sendUser, 0.5);
  }

  // 감동 메시지 저장
  private async saveThankMessage(
    userNo: number,
    letterNo: number,
    thankMsg: number,
    now: string,
  ) {
    await this.prisma.tb_thank_msg.create({
      data: {
        user_no: userNo,
        letter_no: letterNo,
        thank_msg: thankMsg,
        reg_dt: new Date(now),
      },
    });
  }

  // 마음온도 증가
  private async increaseHeartTemper(userNo: number, tmp: number) {
    await this.prisma.tb_user_profile.update({
      where: { user_no: userNo },
      data: {
        heart_temper: {
          increment: +tmp,
        },
      },
    });
  }

  // 편지 리스트 삭제
  async deleteLetter(
    userNo: number,
    letterList: number[],
    tmp = false,
  ): Promise<number> {
    const whereClause = tmp
      ? {
          user_no: userNo,
          status: 0,
          letter_no: { in: letterList },
        }
      : {
          recipient_user_no: userNo,
          letter_no: { in: letterList },
        };

    const result = await this.prisma.tb_letter.updateMany({
      where: whereClause,
      data: { status: 3 },
    });

    if (result.count === 0) {
      throw new BadRequestException('삭제할 편지가 없습니다.');
    }

    return result.count;
  }

  // 편지 작성(임시, 일반)
  async createLetter(userNo: number, letter: CreateLetterDto): Promise<number> {
    const {
      letterNo,
      postNo,
      status,
      stage,
      letterContents,
      fontNo,
      info,
      letterImg,
    } = letter;

    let finalLetterNo = letterNo;

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const isNewTempLetter = status === 0 && letterNo === 0;
    const isSubmitWithoutLetterNo = status === 1 && letterNo === 0;

    // 예약발송 예외 처리
    if (status === 1 && info?.reservationStatus === 1) {
      const reservationTime = dayjs(info.reservationDt);

      const limitTime = reservationTime.subtract(15, 'minute');

      if (limitTime.isBefore(now)) {
        throw new BadRequestException(
          '예약 발송은 현재 시간보다 15분 뒤부터 가능합니다.',
        );
      }
    }

    if (status === 0) {
      // 임시 저장
      if (isNewTempLetter) {
        const result = await this.createNewLetter({
          userNo,
          postNo,
          status,
          stage,
          contents: letterContents,
          fontNo,
          info,
          img: letterImg,
          regDt: now,
        });
        finalLetterNo = result.letter_no;
      } else {
        await this.updateExistingLetter({
          letterNo,
          userNo,
          postNo,
          status,
          stage,
          contents: letterContents,
          fontNo,
          info,
          img: letterImg,
          now,
        });
      }
    } else if (status === 1) {
      // 작성 완료
      let aligoStatus = 0;

      let hashLetter: { letter_no: number; hash_no: string | null };

      if (isSubmitWithoutLetterNo) {
        hashLetter = await this.createNewLetter({
          userNo,
          postNo,
          status,
          stage,
          contents: letterContents,
          fontNo,
          info,
          img: letterImg,
          regDt: now,
        });
        aligoStatus = 1;
      } else {
        hashLetter = await this.updateExistingLetter({
          letterNo,
          userNo,
          postNo,
          status,
          stage,
          contents: letterContents,
          fontNo,
          info,
          img: letterImg,
          now,
        });
        aligoStatus = 1;
      }

      if (!hashLetter) throw new BadRequestException('편지 생성 실패');
      finalLetterNo = hashLetter.letter_no;

      // 알림톡 발송
      if (aligoStatus === 1) {
        try {
          const tmpURL = `${process.env.tmpURL}${hashLetter.hash_no}`;

          const sendDateToAligo =
            info.reservationStatus === 1 && !!info.reservationDt
              ? dayjs(info.reservationDt).format('YYYYMMDDHHmmss')
              : undefined;

          const sendDateToUpdate =
            info.reservationStatus === 1 && !!info.reservationDt
              ? dayjs(info.reservationDt).format('YYYY-MM-DD HH:mm:ss')
              : dayjs().format('YYYY-MM-DD HH:mm:ss');

          // 알림톡 API 호출
          await this.aligoService.sendAlimtalk({
            senderName: info.sender,
            recipientName: info.recipient,
            recipientPhone: info.recipientPhone,
            letterUrl: tmpURL,
            sendDate: sendDateToAligo,
          });

          // 발송 시간 기록
          await this.updateSendDt(finalLetterNo, sendDateToUpdate);
        } catch (error) {
          // 알림톡 실패 시 롤백 처리
          try {
            await this.rollbackLetter(finalLetterNo, now);
          } catch (rollbackErr) {
            console.log('🚀 롤백 중 에러 발생', rollbackErr);
          }
          throw new BadRequestException('알림톡 발송에 실패했습니다.');
        }

        // 마음온도 증가
        await this.increaseHeartTemper(userNo, 1);

        // 종속 처리
        await this.dependentLetter(info.recipientPhone, finalLetterNo);
      }
    }

    return finalLetterNo;
  }

  // 편지 작성(임시저장, 작성완료)
  private async createNewLetter(
    params: CreateNewLetterInput,
  ): Promise<{ letter_no: number; hash_no: string }> {
    const {
      userNo,
      postNo,
      status,
      stage,
      contents,
      fontNo,
      info,
      img,
      regDt,
    } = params;

    const fontSize = 10;
    const pageCnt = 1;

    return await this.prisma.$transaction(async (tx) => {
      // 1. tb_letter 생성
      const letter = await tx.tb_letter.create({
        data: {
          user_no: userNo,
          post_no: postNo,
          status,
          stage,
          reg_dt: regDt ? new Date(regDt) : new Date(),
        },
      });

      const letterNo = letter.letter_no;

      // 2. hash_no 처리 (작성 완료 상태일 경우)
      let hashNo = '';
      if (status === 1) {
        const [result]: any = await this.prisma.$queryRawUnsafe(
          `
            SELECT HEX(AES_ENCRYPT(?, ?)) AS hash_no
          `,
          letterNo.toString(),
          process.env.HASH_KEY,
        );

        hashNo = result.hash_no;

        await tx.tb_letter.update({
          where: { letter_no: letterNo },
          data: { hash_no: hashNo },
        });
      }

      // 3. tb_letter_info 저장
      await tx.tb_letter_info.create({
        data: {
          letter_no: letterNo,
          user_no: userNo,
          post_no: postNo,
          font_no: fontNo,
          font_size: fontSize,
          page_cnt: pageCnt,
          recipient: info.recipient,
          recipient_phone: info.recipientPhone,
          sender: info.sender,
          sender_phone: info.senderPhone,
          reservation_status: info.reservationStatus,
          reservation_dt: info.reservationDt
            ? new Date(info.reservationDt)
            : new Date(),
        },
      });

      // 4. tb_letter_contents 저장
      await tx.tb_letter_contents.create({
        data: {
          letter_no: letterNo,
          user_no: userNo,
          post_no: postNo,
          letter_contents: contents,
          page_no: 1,
          status: 1,
          reg_dt: regDt ? new Date(regDt) : new Date(),
        },
      });

      // 5. tb_letter_img 저장
      for (let i = 0; i < img.length; i++) {
        await tx.tb_letter_img.create({
          data: {
            letter_no: letterNo,
            user_no: userNo,
            post_no: postNo,
            letter_img_url: img[i],
            status: 1,
            view_seq: i,
            reg_dt: regDt ? new Date(regDt) : new Date(),
          },
        });
      }

      return {
        letter_no: letterNo,
        hash_no: hashNo,
      };
    });
  }

  // 임시저장한 편지 수정(임시저장, 작성완료)
  async updateExistingLetter(
    params: UpdateLetterInput,
  ): Promise<{ letter_no: number; hash_no: string | null }> {
    const {
      letterNo,
      userNo,
      postNo,
      status,
      stage,
      contents,
      fontNo,
      info,
      img,
      now,
    } = params;
    const fontSize = 10;
    const pageCnt = 1;

    return await this.prisma.$transaction(async (tx) => {
      // hash_no 생성 (작성 완료 상태일 경우)
      let encryptedHash: string | null = null;
      if (status === 1) {
        const result = await tx.$queryRaw<{ encrypted: string }[]>`
          SELECT HEX(AES_ENCRYPT(${String(letterNo)}, ${process.env.HASH_KEY})) AS encrypted;
        `;

        encryptedHash = result[0]?.encrypted ?? null;
      }

      // 1. letter 상태 업데이트
      await tx.tb_letter.update({
        where: { letter_no: letterNo },
        data: {
          status,
          stage,
          upt_dt: new Date(now),
          ...(status === 1 && { hash_no: encryptedHash }),
        },
      });

      // 2. letter_info 수정
      await tx.tb_letter_info.update({
        where: { letter_no: letterNo },
        data: {
          font_no: fontNo,
          font_size: fontSize,
          page_cnt: pageCnt,
          recipient: info.recipient,
          recipient_phone: info.recipientPhone,
          sender: info.sender,
          sender_phone: info.senderPhone,
          reservation_status: info.reservationStatus,
          reservation_dt: info.reservationDt,
        },
      });

      // 3. 기존 contents 비활성화
      await tx.tb_letter_contents.updateMany({
        where: { letter_no: letterNo },
        data: { status: 0 },
      });

      // 4. 새로운 tb_letter_contents 저장
      await tx.tb_letter_contents.create({
        data: {
          letter_no: letterNo,
          user_no: userNo,
          post_no: postNo,
          letter_contents: contents,
          page_no: 1,
          status: 1,
          reg_dt: new Date(now),
        },
      });

      // 5. 기존 이미지 비활성화
      await tx.tb_letter_img.updateMany({
        where: { letter_no: letterNo },
        data: { status: 0 },
      });

      // 6. 새로운 tb_letter_img 저장
      for (let i = 0; i < img.length; i++) {
        await tx.tb_letter_img.create({
          data: {
            letter_no: letterNo,
            user_no: userNo,
            post_no: postNo,
            letter_img_url: img[i],
            status: 1,
            view_seq: i,
            reg_dt: new Date(now),
          },
        });
      }

      // 7. hash_no 가져오기
      const letter = await tx.tb_letter.findUnique({
        where: { letter_no: letterNo },
        select: { letter_no: true, hash_no: true },
      });

      return letter!;
    });
  }

  // 알림톡 발송 시간 수정
  private async updateSendDt(letterNo: number, sendDt: string) {
    await this.prisma.tb_letter.update({
      where: { letter_no: letterNo },
      data: { send_dt: new Date(sendDt) },
    });
  }

  // 발송한 편지 받는 번호의 유저가 있으면 바로 종속
  private async dependentLetter(recipientPhone: string, letterNo: number) {
    const user = await this.prisma.tb_user_profile.findFirst({
      where: { user_phone: recipientPhone },
      select: { user_no: true },
    });

    if (user) {
      await this.prisma.tb_letter.update({
        where: { letter_no: letterNo },
        data: { recipient_user_no: user.user_no },
      });
    }
  }

  // 작성완료 편지 임시편지로 되돌리기(롤백)
  private async rollbackLetter(letterNo: number, now: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.tb_letter.update({
        where: { letter_no: letterNo },
        data: {
          status: 0,
          upt_dt: new Date(now),
          hash_no: '',
        },
      });

      await tx.tb_letter_img.updateMany({
        where: { letter_no: letterNo },
        data: { status: 0 },
      });
    });
  }
}
