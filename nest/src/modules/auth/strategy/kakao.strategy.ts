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

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
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

    const result = await this.authService.validateUser(
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

    done(null, result);
  }
}
