import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의된 값만 허용
      forbidNonWhitelisted: true, // 정의되지 않은 값이 들어오면 에러
      transform: true, // string → number 자동 변환 등
    }),
  );

  await app.listen(3000);
}
bootstrap();
