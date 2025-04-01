import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController], // 사용자 요청을 처리하는 컨트롤러
  providers: [UserService], // 비즈니스 로직을 처리하는 서비스
})
export class UserModule {}
