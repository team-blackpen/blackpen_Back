import { UserPayload } from '@/common/interfaces/user-payload.interface';

declare module 'express' {
  interface Request {
    user?: UserPayload; // 로그인 정보, Optional 처리
  }
}
