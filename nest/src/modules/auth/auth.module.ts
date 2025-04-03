import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Module({
  imports: [
    PassportModule, // ✅ AuthGuard 사용에 필요
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30000h' },
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    KakaoStrategy, // ✅ 카카오 로그인 전략
    JwtStrategy, // ✅ JWT 인증 전략
    JwtAuthGuard, // ✅ 커스텀 Guard
    OptionalJwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService], // 필요 시
})
export class AuthModule {}
