import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    console.log('🚀 ~ OptionalJwtAuthGuard ~ handleRequest ~ user:', user);
    // ❌ 토큰 검증 실패 등 오류가 있어도 무시하고 null 리턴
    return user ?? null;
  }
}
