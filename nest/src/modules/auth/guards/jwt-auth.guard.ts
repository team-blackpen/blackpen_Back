import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    // 1️⃣ 토큰 없음
    console.log(
      '🚀 ~ JwtAuthGuard ~ handleRequest ~ req.headers.authorization:',
      req.headers.authorization,
    );
    if (!req.headers.authorization) {
      throw new UnauthorizedException('다시 로그인 해주세요.');
    }

    const [authType, token] = req.headers.authorization.split(' ');
    console.log('🚀 ~ JwtAuthGuard ~ handleRequest ~ authType:', authType);

    // 2️⃣ Bearer 타입 아님
    if (authType !== 'Bearer') {
      throw new UnauthorizedException('토큰 타입이 맞지 않습니다.');
    }

    // 3️⃣ 토큰 자체 문제 (만료/위조 등)
    console.log('🚀 ~ JwtAuthGuard ~ handleRequest ~ info:', info);
    if (
      info?.name === 'JsonWebTokenError' ||
      info?.name === 'TokenExpiredError'
    ) {
      throw new UnauthorizedException('토큰이 유효하지 않습니다.');
    }

    // 4️⃣ 유저 없음
    console.log('🚀 ~ JwtAuthGuard ~ handleRequest ~ user:', user);
    if (!user) {
      throw new UnauthorizedException('존재하지 않은 유저입니다.');
    }

    return user;
  }
}
