import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import * as dayjs from 'dayjs';

// import { HeartTemperResult } from './interfaces/heart-temper.interface';

@Injectable()
export class MyService {
  constructor(private readonly prisma: PrismaService) {}

  // 받은 편지 수 조회 (status = 1)
  async getLetterCnt(userNo: number): Promise<number> {
    const count = await this.prisma.tb_letter.count({
      where: {
        status: 1,
        recipient_user_no: userNo,
      },
    });

    return count;
  }

  // 임시 저장 편지 수 조회 (status = 0)
  async getLetterTmpCnt(userNo: number): Promise<number> {
    const yesterday = dayjs()
      .subtract(300, 'day')
      .format('YYYY-MM-DD HH:mm:ss');

    const result: any[] = await this.prisma.$queryRaw`
      SELECT 
        COUNT(L.letter_no) AS letterCnt
      FROM tb_letter L
      WHERE 
        L.status = 0 
        AND L.user_no = ${userNo}
        AND COALESCE(L.upt_dt, L.reg_dt) > ${yesterday}
    `;

    return Number(result[0]?.letterCnt ?? 0);
  }

  // 엽서 찜 목록 수 조회
  async getPostWishCnt(userNo: number): Promise<number> {
    const count = await this.prisma.tb_post_wish.count({
      where: {
        user_no: userNo,
        status: 1,
      },
    });

    return count;
  }

  // 마음 온도 조회
  async getHeartTemper(userNo: number): Promise<number> {
    const profile = await this.prisma.tb_user_profile.findUnique({
      where: { user_no: userNo },
      select: { user_no: true, nickname: true, heart_temper: true },
    });

    return profile?.heart_temper?.toNumber() ?? 0;
  }

  // 닉네임 변경
  async changeNickname(userNo: number, nickname: string): Promise<void> {
    await this.prisma.tb_user_profile.update({
      where: { user_no: userNo },
      data: {
        nickname,
        upt_dt: new Date(),
      },
    });
  }
}
