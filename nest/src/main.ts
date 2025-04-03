import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // AppModule을 기반으로 Nest 애플리케이션 생성
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter()); // ✅ 전역 등록
  app.useGlobalInterceptors(new ResponseInterceptor()); // ✅ 전역 등록
  await app.listen(3000); // 포트 3000에서 애플리케이션 실행
}
bootstrap();
