import { Module } from '@nestjs/common';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { PostModule } from '@/modules/post/post.module';

@Module({
  imports: [AuthModule, PostModule], // 로그인 여부 확인
  controllers: [LetterController],
  providers: [LetterService, PrismaService],
})
export class LetterModule {}
