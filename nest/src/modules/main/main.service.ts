import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class MainService {
  constructor(private readonly prisma: PrismaService) {}

  // 안 읽은 편지 수 조회
  async getLetterListCnt(userNo: number): Promise<number> {
    const result: any[] = await this.prisma.$queryRaw`
      SELECT 
        COUNT(L.letter_no) AS letterListCnt
      FROM tb_letter L
      LEFT JOIN tb_letter_read_log Lrl
        ON L.letter_no = Lrl.letter_no AND Lrl.recipient_user_no = ${userNo}
      WHERE 
        L.status = 1
        AND L.recipient_user_no = ${userNo}
        AND Lrl.letter_read_log_no IS NULL;
    `;

    return result[0]?.letterListCnt ?? 0;
  }

  // 임시 편지 리스트 조회 (최근 1일 이내, 최대 3개)
  async getLetterTmpList(userNo: number) {
    const yesterday = dayjs()
      .subtract(300, 'day')
      .format('YYYY-MM-DD HH:mm:ss');

    const result: any[] = await this.prisma.$queryRaw`
      SELECT 
        L.letter_no, L.user_no, L.post_no, 
        IF(L.upt_dt, L.upt_dt, L.reg_dt) AS upt_dt, 
        Lc.letter_contents_no, Lc.letter_contents
      FROM tb_letter L
      JOIN tb_letter_contents Lc 
        ON L.letter_no = Lc.letter_no AND Lc.status = 1
      WHERE 
        L.status = 0 
        AND L.user_no = ${userNo}
        AND COALESCE(L.upt_dt, L.reg_dt) > ${yesterday}
      ORDER BY upt_dt DESC
      LIMIT 3;
    `;

    return result;
  }

  // 랜덤 글귀 조회 (1개)
  async getQuote() {
    const list = await this.getQuoteList(); // 중복 제거 👇
    if (!list.length) return null;

    const random = Math.floor(Math.random() * list.length);

    return list[random];
  }

  // 전체 글귀 리스트 조회
  async getQuoteList() {
    return await this.prisma.tb_quote.findMany({
      where: { status: 1 },
      select: {
        quote_no: true,
        quote: true,
        author: true,
        category: true,
      },
    });
  }

  // 다가오는 기념일 조회
  async getAnniversary() {
    const today = parseInt(dayjs().format('YYYYMMDD'), 10);

    const anniversary = await this.prisma.tb_anniversary.findFirst({
      where: {
        date: {
          gte: today, // 오늘 이후
        },
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        anniversary_no: true,
        date: true,
        anniversary_title: true,
        anniversary_des: true,
      },
    });

    return anniversary ?? null;
  }

  // 방문 로그 저장 (userNo optional)
  async visitLog(chCd: number, pathCd: number, userNo: number) {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    if (userNo === 0) {
      // 비회원: 바로 생성
      await this.prisma.$executeRaw`
        INSERT INTO tb_visit_log (chCd, pathCd, reg_dt, user_no)
        VALUES (${chCd}, ${pathCd}, ${now}, ${userNo});
      `;
    } else {
      // 회원: 기존 로그가 없을 때만 생성
      const existing = await this.prisma.tb_visit_log.findFirst({
        where: { user_no: userNo },
      });

      if (!existing) {
        await this.prisma.$executeRaw`
          INSERT INTO tb_visit_log (chCd, pathCd, reg_dt, user_no)
          VALUES (${chCd}, ${pathCd}, ${now}, ${userNo});
        `;
      }
    }
  }

  // 선물하기 로그 저장 (로그인 여부에 따라 user_no는 null일 수 있음)
  async postGift(userNo: number | null, giftPrice: number) {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    await this.prisma.$executeRaw`
      INSERT INTO tb_gift_log (user_no, gift_price, reg_dt)
      VALUES (${userNo}, ${giftPrice}, ${now})
    `;
  }
}
