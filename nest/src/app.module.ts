import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { QuoteModule } from './modules/quote/quote.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 전역 사용
    }),
    PrismaModule, // Prisma를 통한 데이터베이스 연결을 제공하는 모듈
    UserModule, // 사용자 관련 기능을 제공하는 모듈
    QuoteModule, // 명언 관련 기능을 제공하는 모듈
    AuthModule,
  ],
})
export class AppModule {}
