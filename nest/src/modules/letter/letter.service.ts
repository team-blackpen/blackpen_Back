import { Injectable, BadRequestException } from '@nestjs/common';

import { PostService } from '@/modules/post/post.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as dayjs from 'dayjs';

import { LetterListItem } from './interfaces/letter-list-item.interface';
import { LetterTmpListItem } from './interfaces/letter-tmp-list-item.interface';
import { LetterDetailItem } from './interfaces/letter-detail-item.interface';
import { Font } from './interfaces/letter-font.interface';
import { LetterTmp } from './interfaces/letter-tmp-item.interface';
import { LetterCheckResult } from './interfaces/letter-check.interface';

@Injectable()
export class LetterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postService: PostService,
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
    // hashLetter가 있을 경우 게스트 없으면 유저
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
    const font = await this.prisma.$queryRaw<any[]>`
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
    console.log('🚀 ~ LetterService ~ result:', result);

    return result.count;
  }
}
