import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: process.env.KAKAO_CB_URL,
    });
  }

  /*
   * 카카오 로그인 성공 시 호출
   * - 사용자 존재 여부 확인 및 생성, 수정
   * - JWT 토큰 생성
   */
  async validate(accessToken: string, _refreshToken: string, profile: any) {
    const kakaoAccount = profile._json.kakao_account;

    const kakaoId = profile.id.toString();
    const nickname = profile.displayName || kakaoAccount?.profile?.nickname;

    const profileImage = kakaoAccount?.profile?.profile_image_url || '';
    const email = kakaoAccount?.email || null;
    const name = kakaoAccount?.name || null;
    const gender = kakaoAccount?.gender || null;
    const ageRange = kakaoAccount?.age_range || null;
    const birthYear = kakaoAccount?.birthyear || null;
    const birthday = kakaoAccount?.birthday || null;
    const phoneNumber = kakaoAccount?.phone_number || null;

    // 사용자 검증 (DB 조회 또는 생성, 수정)
    const user = await this.authService.validateUser(
      kakaoId,
      nickname,
      profileImage,
      accessToken,
      email,
      name,
      gender,
      phoneNumber,
      ageRange,
      birthYear,
      birthday,
    );

    const payload = {
      user_no: user.user_no,
      nickname: user.tb_user_profile?.nickname,
      kakaoId,
    };

    // JWT 토큰 생성
    const accessTokenJwt = this.authService.generateToken(payload);

    return {
      message: '카카오 로그인 성공',
      user: payload,
      accessToken: accessTokenJwt,
    };
  }
}
