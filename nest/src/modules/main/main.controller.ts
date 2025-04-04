import {
  Controller,
  SetMetadata,
  UseGuards,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { MainService } from './main.service';
import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@/modules/auth/guards/optional-jwt-auth.guard';

@Controller('main')
export class MainController {
  constructor(private readonly mainService: MainService) {}

  // 안 읽은 편지 수 조회 (로그인 필수)
  // GET /main/list-cnt
  @UseGuards(JwtAuthGuard)
  @SetMetadata('responseMsg', '안 읽은 편지 수 조회')
  @Get('list-cnt')
  async getLetterListCnt(@User('user_no') userNo: number) {
    const letterListCnt = await this.mainService.getLetterListCnt(userNo);

    return letterListCnt;
  }

  // 임시 편지 리스트 조회 (최근 1일 이내, 최대 3개, 로그인 필수)
  // GET /main/tmp-list
  @UseGuards(JwtAuthGuard)
  @SetMetadata('responseMsg', '임시 편지 리스트 조회')
  @Get('tmp-list')
  async getLetterTmpList(@User('user_no') userNo: number) {
    const letterTmpList = await this.mainService.getLetterTmpList(userNo);

    return letterTmpList;
  }

  // 랜덤 글귀 조회 (1개, 비로그인 가능)
  // GET /main/quote
  @SetMetadata('responseMsg', '랜덤 글귀 조회')
  @Get('quote')
  async getQuote() {
    const quote = await this.mainService.getQuote();

    return quote;
  }

  // 전체 글귀 리스트 조회 (비로그인 가능)
  // GET /main/quote-list
  @SetMetadata('responseMsg', '전체 글귀 리스트 조회')
  @Get('quote-list')
  async getQuoteList() {
    const quoteList = await this.mainService.getQuoteList();

    return quoteList;
  }

  // 다가오는 기념일 조회 (비로그인 가능)
  // GET /main/anniversary
  @SetMetadata('responseMsg', '다가오는 기념일 조회')
  @Get('anniversary')
  async getAnniversary() {
    const anniversary = await this.mainService.getAnniversary();

    return anniversary;
  }

  // 방문 로그 저장 (비로그인 가능, userNo optional)
  // POST /main/visit
  @SetMetadata('responseMsg', '방문 로그 저장')
  @Post('visit')
  async visitLog(
    @Body('userNo') userNo: number,
    @Body('chCd') chCd: number,
    @Body('pathCd') pathCd: number,
  ) {
    userNo = userNo ?? 0;

    await this.mainService.visitLog(chCd, pathCd, userNo);

    return { chCd, pathCd, userNo };
  }

  // 선물하기 로그 저장 (로그인 선택)
  // POST /main/gift
  @UseGuards(OptionalJwtAuthGuard)
  @SetMetadata('responseMsg', '선물 로그 저장')
  @Post('gift')
  async postGift(@User() user: any, @Body('giftPrice') giftPrice: number) {
    const userNo = user?.user_no ?? null;

    await this.mainService.postGift(userNo, giftPrice);

    return;
  }
}
