import {
  Controller,
  SetMetadata,
  UseGuards,
  Get,
  Put,
  Body,
} from '@nestjs/common';

import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { MyService } from './my.service';

import { ChangeNicknameDto } from './dto/change-nickname.dto';

import { HeartTemperResult } from './interfaces/heart-temper.interface';

@Controller('my')
export class MyController {
  constructor(private readonly myService: MyService) {}

  // 받은 편지 수 조회
  // GET /my/letter-cnt
  @UseGuards(JwtAuthGuard)
  @Get('letter-cnt')
  @SetMetadata('responseMsg', '받은 편지 수 조회')
  async getLetterCnt(@User('user_no') userNo: number): Promise<number> {
    const letterCnt = await this.myService.getLetterCnt(userNo);

    return letterCnt;
  }

  // 임시 저장 편지 수 조회
  // GET /my/letter-tmp-cnt
  @UseGuards(JwtAuthGuard)
  @Get('letter-tmp-cnt')
  @SetMetadata('responseMsg', '임시 저장 편지 수 조회')
  async getLetterTmpCnt(@User('user_no') userNo: number): Promise<number> {
    const letterCnt = await this.myService.getLetterTmpCnt(userNo);

    return letterCnt;
  }

  // 엽서 찜 목록 수 조회
  // GET /my/post-wish-cnt
  @UseGuards(JwtAuthGuard)
  @Get('post-wish-cnt')
  @SetMetadata('responseMsg', '엽서 찜 목록 수 조회')
  async getPostWishCnt(@User('user_no') userNo: number): Promise<number> {
    const postWishCnt = await this.myService.getPostWishCnt(userNo);

    return postWishCnt;
  }

  // 마음 온도 조회
  // GET /my/heart-temper
  @UseGuards(JwtAuthGuard)
  @Get('heart-temper')
  @SetMetadata('responseMsg', '마음 온도 조회')
  async getHeartTemper(
    @User('user_no') userNo: number,
  ): Promise<HeartTemperResult | number> {
    const heartTemper = await this.myService.getHeartTemper(userNo);

    return heartTemper;
  }

  // 닉네임 변경
  // PUT /my/change-nickname
  @UseGuards(JwtAuthGuard)
  @Put('change-nickname')
  @SetMetadata('responseMsg', '닉네임 변경')
  async changeNickname(
    @User('user_no') userNo: number,
    @Body() body: ChangeNicknameDto,
  ) {
    const { nickname } = body;

    await this.myService.changeNickname(userNo, nickname);

    return { userNo, nickname };
  }
}
