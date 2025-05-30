import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MainModule } from './modules/main/main.module';
import { MyModule } from './modules/my/my.module';
import { PostlistModule } from './modules/postlist/postlist.module';
import { PostModule } from './modules/post/post.module';
import { LetterModule } from './modules/letter/letter.module';
import { UserModule } from './modules/user/user.module';
import { AligoTestModule } from '@/modules/aligo-test/aligo-test.module';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    // .env 환경변수 전역 설정
    ConfigModule.forRoot({ isGlobal: true }),

    // DB 연결을 위한 Prisma 설정 모듈
    PrismaModule,

    // 인증 및 사용자 관련 모듈 (카카오 로그인 등)
    AuthModule,

    // 메인 기능 관련 모듈 (글귀, 임시편지 등)
    MainModule,

    // 마이페이지 관련 모듈 (받은 편지, 찜, 마음온도, 닉네임 변경 등)
    MyModule,

    // 편지지 리스트 관련 모듈 (전체 조회, 카테고리별 조회, 찜 등)
    PostlistModule,

    // 편지지 상세 관련 모듈 (상세조회 등)
    PostModule,

    // 편지 관련 모듈 (작성, 임시저장, 발송, 조회, 삭제 등)
    LetterModule,

    UserModule, // 삭제 예정

    AligoTestModule, // 알림톡 테스트 용
  ],
  providers: [
    // 공통 응답 인터셉터
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // 예외 필터 (에러 핸들링)
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
