import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Authorization 헤더에서 Bearer 토큰 추출
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  /*
   * JWT 토큰이 유효한 경우 실행됨
   * @param payload JWT 토큰에서 디코딩된 값
   * @returns 유효한 사용자 정보 or 예외 발생
   */
  async validate(payload: any) {
    // DB에서 사용자 존재 여부 확인
    const user = await this.prisma.tb_user.findUnique({
      where: { user_no: payload.user_no },
    });

    if (!user) {
      throw new UnauthorizedException('존재하지 않은 유저입니다.');
    }

    return payload; // req.user에 들어감
  }
}
