import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 요청 body 검증을 위한 ValidationPipe 전역 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 요청 데이터 타입 자동 변환
      whitelist: true, // DTO에 정의되지 않은 값 제거
      forbidNonWhitelisted: true, // 정의되지 않은 값이 있으면 에러 발생
    }),
  );

  await app.listen(3000);
}
bootstrap();
