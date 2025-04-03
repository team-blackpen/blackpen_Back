import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class MainService {
  constructor(private readonly prisma: PrismaService) {}

  async getLetterListCnt(user_no: number): Promise<number> {
    try {
      const result: Array<{ letterListCnt: number }> = await this.prisma
        .$queryRaw`
        SELECT 
          COUNT(L.letter_no) AS letterListCnt
        FROM tb_letter L
        LEFT JOIN tb_letter_read_log Lrl 
          ON L.letter_no = Lrl.letter_no AND Lrl.recipient_user_no = ${user_no}
        WHERE 
          L.status = 1 
          AND L.recipient_user_no = ${user_no} 
          AND Lrl.letter_read_log_no IS NULL
      `;
      return Number(result[0]?.letterListCnt ?? 0);
    } catch (err) {
      throw new Error('메인 새로운 편지 카운트 조회 실패');
    }
  }

  async getLetterTmpList(user_no: number) {
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
        AND L.user_no = ${user_no} 
        AND COALESCE(L.upt_dt, L.reg_dt) > ${yesterday}
      ORDER BY upt_dt DESC
      LIMIT 3
    `;

    return result;
  }

  // // ✅ 메인 화면에서 무작위로 글귀 1개 조회
  // async getQuote() {
  //   const quoteList: any[] = await this.prisma.$queryRaw`
  //     SELECT
  //       quote_no, quote, author, category
  //     FROM tb_quote
  //     WHERE
  //       status = 1
  //   `;

  //   const max = quoteList.length;
  //   const randomInt = Math.floor(Math.random() * max);
  //   const quote = quoteList[randomInt];

  //   return quote;
  // }

  // ✅ /main/quote-list - 전체 글귀 리스트 조회
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

  // ✅ /main/quote - 랜덤 글귀 1개 조회
  async getQuote() {
    const list = await this.getQuoteList(); // 중복 제거 👇
    if (!list.length) return null;

    const random = Math.floor(Math.random() * list.length);
    return list[random];
  }

  // ✅ 오늘 이후 가장 가까운 기념일 조회
  async getAnniversary() {
    // const today = dayjs().format('YYYYMMDD');
    // const today = parseInt(dayjs().format('YYYYMMDD'), 10); // 👈 문자열 → 숫자
    const today = Number(dayjs().format('YYYYMMDD'));

    const anniversary = await this.prisma.tb_anniversary.findFirst({
      where: {
        date: {
          gte: today, // 오늘 이후
        },
      },
      orderBy: {
        date: 'asc', // 가까운 날짜 순
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

  // 👉 방문 로그 기록 (비회원 포함)
  async visitLog(chCd: string, pathCd: string, userNo: number) {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    if (userNo === 0) {
      // 비회원: 바로 삽입
      await this.prisma.$executeRaw`
        INSERT INTO tb_visit_log (chCd, pathCd, reg_dt, user_no)
        VALUES (${chCd}, ${pathCd}, ${now}, ${userNo});
      `;
    } else {
      // 회원: 기존 로그가 없을 때만 삽입
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

  // ✅ 메인 선물하기 로그 수집
  async postGift(userNo: number, giftPrice: number) {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    await this.prisma.$executeRaw`
      INSERT INTO tb_gift_log (user_no, gift_price, reg_dt)
      VALUES (${userNo}, ${giftPrice}, ${now})
    `;
  }
}
