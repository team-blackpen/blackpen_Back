import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// 로그인 필수인 API에서 사용하는 JWT 인증 Guard
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    // 🔐 Passport 내부에서 JWT 유효성 검사 실패 시
    if (info?.message === 'No auth token') {
      throw new UnauthorizedException('토큰이 존재하지 않습니다.');
    }

    if (info?.message === 'invalid token') {
      throw new UnauthorizedException('유효하지 않은 토큰 형식입니다.');
    }

    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }

    if (!user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return user;
  }
}
