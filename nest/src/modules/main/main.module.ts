import { Module } from '@nestjs/common';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule], // 로그인 여부 확인
  controllers: [MainController],
  providers: [MainService, PrismaService],
})
export class MainModule {}
