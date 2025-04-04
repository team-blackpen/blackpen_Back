import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtStrategy } from './strategy/jwt.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';

@Module({
  imports: [
    // Passport 기반 인증 모듈 (Guard 동작에 필요)
    PassportModule,

    // JWT 설정 모듈 (비밀키 및 만료 시간 설정)
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30000h' },
    }),
  ],
  controllers: [
    // 카카오 로그인 API 제공
    AuthController,
  ],
  providers: [
    // 카카오 및 JWT 인증 전략 정의
    AuthService,
    JwtStrategy,
    KakaoStrategy,
  ],
  exports: [
    // 다른 모듈에서 AuthService 사용 가능하게 내보냄
    AuthService,
  ],
})
export class AuthModule {}
