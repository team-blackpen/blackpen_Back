import {
  Controller,
  SetMetadata,
  UseGuards,
  Get,
  Param,
  Query,
  Post,
  Body,
} from '@nestjs/common';

import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { PostlistService } from './postlist.service';

import { PostWishDto } from './dto/post-wish.dto';

import { PostCategory } from './interfaces/post-category.interface';
import { PostItem } from './interfaces/post-item.interface';
import { PostListGroup } from './interfaces/post-list-group.interface';
import { PostCategoryListResponse } from './interfaces/post-category-list-response.interface';
import { PostWish } from './interfaces/post-wish.interface';

@Controller('postlist')
export class PostlistController {
  constructor(private readonly postlistService: PostlistService) {}

  // 카테고리 리스트 조회(비로그인 가능)
  // GET /postlist/category
  @Get('category')
  @SetMetadata('responseMsg', '카테고리 리스트 조회')
  async getCategory(): Promise<{ categoryList: PostCategory[] }> {
    const categoryList = await this.postlistService.getCategory();
    return { categoryList };
  }

  // 편지지 전체 조회(비로그인 가능)
  // GET /postlist
  @Get()
  @SetMetadata('responseMsg', '편지지 전체 조회')
  async getAllPost(): Promise<{ postList: PostListGroup[] }> {
    const postList = this.postlistService.getAllPost();

    return postList;
  }

  // 카테고리별 편지지 조회(로그인 필수 limit=5, page 쿼리 기준 offset)
  // GET /postlist/category/:post_cate_no
  @Get('category/:post_cate_no')
  @SetMetadata('responseMsg', '카테고리별 편지지 조회')
  async getPostCategory(
    @Param('post_cate_no') postCateNo: number,
    @Query('page') page?: string,
  ): Promise<PostCategoryListResponse> {
    const pageNumber = parseInt(page ?? '1', 10);
    const safePage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

    const limit = 5;
    const offset = (safePage - 1) * limit;

    const postList = await this.postlistService.getPostCategory(
      postCateNo,
      limit,
      offset,
    );

    return postList;
  }

  // 편지지 찜목록 리스트 조회(로그인 필수)
  // GET /postlist/wish
  @UseGuards(JwtAuthGuard)
  @Get('wish')
  @SetMetadata('responseMsg', '편지지 찜목록 리스트 조회')
  async getPostWish(
    @User('user_no') userNo: number,
  ): Promise<{ postWishList: PostWish[] }> {
    const postWishList = await this.postlistService.getPostWish(userNo);

    return { postWishList };
  }

  // 편지지 찜목록 카테고리 리스트 조회(로그인 필수)
  // GET /postlist/wish/cate
  @UseGuards(JwtAuthGuard)
  @Get('wish/cate')
  @SetMetadata('responseMsg', '편지지 찜목록 카테고리 리스트 조회')
  async getPostWishCate(
    @User('user_no') userNo: number,
  ): Promise<{ postWishList: PostCategory[] }> {
    const postWishList = await this.postlistService.getPostWishCate(userNo);

    return { postWishList };
  }

  // 편지지 찜목록 카테고리 별 리스트 조회(로그인 필수)
  // GET /postlist/wish/list/:post_cate_no
  @UseGuards(JwtAuthGuard)
  @Get('wish/list/:post_cate_no')
  @SetMetadata('responseMsg', '편지지 찜목록 카테고리 별 리스트 조회')
  async getPostWishListCate(
    @User('user_no') userNo: number,
    @Param('post_cate_no') postCateNo: number,
  ): Promise<{ postWishList: PostItem[] }> {
    const postWishList = await this.postlistService.getPostWishListCate(
      userNo,
      postCateNo,
    );

    return { postWishList };
  }

  // 편지지 찜목록 등록/삭제(로그인 필수)
  // POST /postlist/wish
  @UseGuards(JwtAuthGuard)
  @Post('wish')
  @SetMetadata('responseMsg', '편지지 찜목록 등록/삭제')
  async insPostWish(
    @User('user_no') userNo: number,
    @Body() body: PostWishDto,
  ): Promise<{ userNo: number; postNo: number; msg: string }> {
    const { postNo } = body;

    const result = await this.postlistService.insPostWish(userNo, postNo);

    return result;
  }
}
