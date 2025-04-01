import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // AppModule을 기반으로 Nest 애플리케이션 생성
  const app = await NestFactory.create(AppModule);
  await app.listen(3000); // 포트 3000에서 애플리케이션 실행
}
bootstrap();
