import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('🚀 ~ JwtStrategy ~ validate ~ payload:', payload);
    const user = await this.prisma.tb_user.findUnique({
      where: { user_no: payload.user_no },
    });

    console.log('🚀 ~ JwtStrategy ~ validate ~ user:', user);
    return user || null; // req.user에 들어가는 값
  }
}
