import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// 로그인 선택인 API에서 사용하는 Guard (토큰 없어도 통과)
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // ❗️에러가 있거나 토큰이 없으면 그냥 null 반환
    return user ?? null;
  }
}
