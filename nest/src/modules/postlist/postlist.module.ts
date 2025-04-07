import { Module } from '@nestjs/common';
import { PostlistController } from './postlist.controller';
import { PostlistService } from './postlist.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule], // 로그인 여부 확인
  controllers: [PostlistController],
  providers: [PostlistService, PrismaService],
})
export class PostlistModule {}
