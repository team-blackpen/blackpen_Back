import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { QuoteModule } from './modules/quote/quote.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    UserModule, // 사용자 관련 기능을 제공하는 모듈
    QuoteModule, // 명언 관련 기능을 제공하는 모듈
    PrismaModule, // Prisma를 통한 데이터베이스 연결을 제공하는 모듈
  ],
})
export class AppModule {}
