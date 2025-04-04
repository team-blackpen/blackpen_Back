import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  /*
   * 모든 API 응답을 공통 구조로 감싸주는 인터셉터
   * - result: 0 (성공)
   * - msg: 커스텀 메시지 or 기본 메시지
   * - data: 있을 경우만 포함
   */

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const msg =
      this.reflector.get<string>('responseMsg', handler) ?? '요청 성공';

    return next.handle().pipe(
      map((data) => {
        const base = {
          result: 0,
          msg,
        };

        if (data !== undefined && data !== null) {
          return { ...base, data };
        }
        return base;
      }),
    );
  }
}
