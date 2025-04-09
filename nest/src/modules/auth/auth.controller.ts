import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  /*
   * 카카오 로그인 요청
   * - GET /auth/kakao
   * - 카카오 인증 페이지로 리디렉션
   */
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoLogin() {
    // passport-kakao가 자동 처리 → 카카오 로그인 페이지로 리다이렉트
  }

  /*
   * 카카오 로그인 콜백
   * - GET /auth/kakao/callback
   * - 성공 시 사용자 + JWT 토큰 포함 응답
   */
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  kakaoCallback(@Req() req) {
    return req.user; // strategy에서 return한 값 (user + accessToken)
  }
}
