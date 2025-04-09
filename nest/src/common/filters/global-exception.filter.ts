import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/*
 * 전역 예외 처리 필터
 * - 모든 예외를 가로채어 클라이언트에게 일관된 에러 응답을 보냄
 */

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const isGlobalException = exception instanceof HttpException;
    const status = isGlobalException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isGlobalException
      ? exception.getResponse()
      : '서버 내부 오류가 발생했습니다.';

    console.log('🚀 ~ GlobalExceptionFilter ~ exception:', exception);

    res.status(status).json({
      result: -1,
      msg: typeof message === 'string' ? message : message['message'],
    });
  }
}
