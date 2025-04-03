// src/common/interceptors/response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const handler = context.getHandler(); // 👈 여기에 메타데이터 달려있음

    const responseMsg = Reflect.getMetadata('responseMsg', handler);
    const msg = responseMsg || '요청 성공';

    return next.handle().pipe(
      map((data) => {
        const res = {
          result: 0,
          msg,
        };
        if (data !== undefined && data !== null) {
          res['data'] = data;
        }
        return res;
      }),
    );
  }
}
