import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // 사용자 검증 / 생성, 수정
  async validateUser(
    kakaoId: string,
    nickname: string,
    profileImage: string,
    accessToken: string,
    email?: string,
    name?: string,
    gender?: string,
    userPhone?: string,
    ageRange?: string,
    birthYear?: string,
    birthday?: string,
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // 사용자 조회
      let user = await prisma.tb_user.findFirst({
        where: { social_id: kakaoId },
        include: { tb_user_profile: true },
      });

      // 사용자 없을 시: tb_user와 tb_user_profile 생성
      if (!user) {
        user = await prisma.tb_user.create({
          data: {
            social_id: kakaoId,
            login_type: 'kakao',
            access_token: accessToken,
            reg_dt: new Date(),
            tb_user_profile: {
              create: {
                nickname,
                user_img_url: profileImage,
                heart_temper: new Prisma.Decimal(36),
                email,
                name,
                gender,
                user_phone: userPhone,
                age_range: ageRange,
                birth_year: birthYear,
                birthday,
                upt_dt: new Date(),
              },
            },
          },
          include: { tb_user_profile: true },
        });
      } else {
        // 사용자 있을 시: access_token 및 프로필 이미지 업데이트
        user = await prisma.tb_user.update({
          where: { user_no: user.user_no },
          data: {
            access_token: accessToken,
            tb_user_profile: {
              update: {
                user_img_url: profileImage,
                nickname,
                email,
                name,
                gender,
                user_phone: userPhone,
                age_range: ageRange,
                birth_year: birthYear,
                birthday,
                upt_dt: new Date(),
              },
            },
          },
          include: { tb_user_profile: true },
        });
      }

      return user;
    });
  }

  // 토큰 발급
  generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }
}
