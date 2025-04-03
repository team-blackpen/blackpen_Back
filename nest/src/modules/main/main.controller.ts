import {
  Controller,
  SetMetadata,
  Get,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@/modules/auth/guards/optional-jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { MainService } from './main.service';

@Controller('main')
export class MainController {
  constructor(private readonly mainService: MainService) {}

  // ✅ GET /main/list-cnt
  @UseGuards(JwtAuthGuard) // ✅ 로그인 필수
  @SetMetadata('responseMsg', '새로운(안읽은) 편지 카운트 조회')
  @Get('list-cnt')
  async getLetterListCnt(@User() user: any) {
    console.log('🚀 ~ MainController ~ getLetterListCnt ~ user:', user);
    const letterListCnt = await this.mainService.getLetterListCnt(user.user_no);

    return letterListCnt;
  }

  // ✅ GET /main/tmp-list
  @UseGuards(JwtAuthGuard)
  @SetMetadata('responseMsg', '임시편지 리스트 3개 조회')
  @Get('tmp-list')
  async getLetterTmpList(@User() user: any) {
    const letterTmpList = await this.mainService.getLetterTmpList(user.user_no);

    return letterTmpList;
  }

  // ✅ GET /main/quote-list
  // 👉 로그인 없이 글귀 전체 목록 조회
  @SetMetadata('responseMsg', '글귀 전체 조회')
  @Get('quote-list')
  async getQuoteList() {
    const quoteList = await this.mainService.getQuoteList();

    return quoteList;
  }

  // ✅ GET /main/quote
  // 👉 로그인 없이 사용 가능. 메인에서 무작위 글귀를 조회하는 API
  @SetMetadata('responseMsg', '랜덤 글귀 조회')
  @Get('quote')
  async getQuote() {
    const quote = await this.mainService.getQuote();

    return quote;
  }

  // ✅ GET /main/anniversary
  // 👉 로그인 필요 없음. 오늘 이후 가장 가까운 기념일 1개 조회
  @SetMetadata('responseMsg', '가까운 기념일 조회')
  @Get('anniversary')
  async getAnniversary() {
    const anniversary = await this.mainService.getAnniversary();

    return anniversary;
  }

  // ✅ POST /main/visit
  // 👉 방문 로그 기록 (비회원 포함)
  @SetMetadata('responseMsg', '방문 로그 수집')
  @Post('visit')
  async visitLog(@Body() body: any) {
    const { chCd, pathCd, userNo } = body;
    const logUserNo = userNo ?? 0;

    console.log(`visitLog - Request Body: ${JSON.stringify(body)}`);

    await this.mainService.visitLog(chCd, pathCd, logUserNo);

    return { chCd, pathCd, userNo: logUserNo };
  }

  // ✅ POST /main/gift - 로그인 여부에 따라 user 정보가 없을 수도 있음
  @UseGuards(OptionalJwtAuthGuard)
  @SetMetadata('responseMsg', '선물 로그 수집')
  @Post('gift')
  async postGift(@User() user: any, @Body('giftPrice') giftPrice: number) {
    console.log('🚀 ~ MainController ~ postGift ~ user:', user);
    const userNo = user?.user_no ?? null; // 로그인 안 했으면 null으로 기록
    console.log('🚀 ~ MainController ~ postGift ~ userNo:', userNo);

    await this.mainService.postGift(userNo, giftPrice);

    return;
  }
}
