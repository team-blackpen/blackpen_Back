import { Module } from '@nestjs/common';
import { MyController } from './my.controller';
import { MyService } from './my.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule], // 로그인 여부 확인
  controllers: [MyController],
  providers: [MyService, PrismaService],
})
export class MyModule {}
