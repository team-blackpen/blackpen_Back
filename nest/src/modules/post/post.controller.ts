import { Controller, SetMetadata, Get, Param, UseGuards } from '@nestjs/common';

import { User } from '@/common/decorators/user.decorator';
import { OptionalJwtAuthGuard } from '@/modules/auth/guards/optional-jwt-auth.guard';

import { PostService } from './post.service';

import { PostDetail } from './interfaces/post-detail.interface';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // 편지지 상세 조회
  // GET /post/detail/:post_no
  @UseGuards(OptionalJwtAuthGuard)
  @Get('detail/:post_no')
  @SetMetadata('responseMsg', '편지지 상세 조회')
  async getPostDetail(
    @User('user_no') userNo: number | undefined,
    @Param('post_no') postNo: number,
  ): Promise<{ postDetail: PostDetail }> {
    const postDetail = await this.postService.getPostDetail(userNo, postNo);

    return { postDetail };
  }
}
