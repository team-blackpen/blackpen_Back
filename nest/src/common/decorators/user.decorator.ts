import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '@/common/interfaces/user-payload.interface';

/*
 * 요청에서 user 정보를 추출하는 커스텀 데코레이터
 *
 * @example
 * - 전체 유저 정보: @User()
 * - 특정 필드만 추출: @User('user_no')
 */

export const User = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserPayload | undefined;

    // @User('user_no') → user?.user_no
    return data ? user?.[data] : user;
  },
);
