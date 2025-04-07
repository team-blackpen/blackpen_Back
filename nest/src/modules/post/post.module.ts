import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule], // 로그인 여부 확인
  controllers: [PostController],
  providers: [PostService, PrismaService],
})
export class PostModule {}
