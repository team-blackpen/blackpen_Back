import {
  Controller,
  SetMetadata,
  UseGuards,
  Get,
  Query,
  Param,
  Post,
  Body,
  Delete,
} from '@nestjs/common';

import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { LetterService } from './letter.service';

import { PostThankDto } from './dto/post-thank.dto';
import { DeleteLetterDto } from './dto/delete-letter.dto';

import { LetterListItem } from './interfaces/letter-list-item.interface';
import { LetterTmpListItem } from './interfaces/letter-tmp-list-item.interface';
import { LetterDetailItem } from './interfaces/letter-detail-item.interface';
import { LetterTmp } from './interfaces/letter-tmp-item.interface';

@Controller('letter')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  // 편지 보관함 조회(로그인 필수)
  // GET /letter/list
  @UseGuards(JwtAuthGuard)
  @Get('list')
  @SetMetadata('responseMsg', '편지 보관함 조회')
  async getLetterList(
    @User('user_no') userNo: number,
  ): Promise<{ letterList: LetterListItem[] }> {
    const letterList = await this.letterService.getLetterList(userNo);

    return { letterList };
  }

  // 임시 편지 보관함 조회 성공
  // GET /letter/tmp/list
  @UseGuards(JwtAuthGuard)
  @Get('tmp/list')
  @SetMetadata('responseMsg', '임시 편지 보관함 조회')
  async getLetterTmpList(
    @User('user_no') userNo: number,
  ): Promise<{ letterTmpList: LetterTmpListItem[] }> {
    const letterTmpList = await this.letterService.getLetterTmpList(userNo);
    return { letterTmpList };
  }

  // 편지 수신
  // GET /letter
  @UseGuards(JwtAuthGuard)
  @Get()
  @SetMetadata('responseMsg', '편지 수신')
  async getLetter(
    @User('user_no') userNo: number,
    @Query('letter_no') letterNo: number,
    // @Query('hash_no') hashNo?: string,
  ): Promise<{ letter: LetterDetailItem }> {
    // const letter = await this.letterService.getLetter(userNo, letterNo, hashNo);
    const letter = await this.letterService.getLetter(userNo, letterNo);

    return { letter };
  }

  // 게스트 편지 수신
  // GET /letter/guest/:hash_letter
  @Get('guest/:hash_letter')
  @SetMetadata('responseMsg', '게스트 편지 수신')
  async getLetterHash(
    @Param('hash_letter') hashLetter: string,
  ): Promise<{ letter: LetterDetailItem }> {
    const letter = await this.letterService.getLetter(0, 0, hashLetter);

    return { letter };
  }

  // 폰트 조회
  // GET /letter/font
  @Get('font')
  @SetMetadata('responseMsg', '폰트 조회')
  async getFont(@Query('page') page?: string) {
    const limit = 5;
    const pageNumber = parseInt(page ?? '1', 10);
    const safePage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
    const offset = (safePage - 1) * limit;

    const fontData = await this.letterService.getFont(limit, offset);

    return {
      font: fontData.font,
      nextData: fontData.nextData,
    };
  }

  // 임시저장 편지 조회
  // GET /letter/tmp/:letter_no
  @UseGuards(JwtAuthGuard)
  @Get('tmp/:letter_no')
  @SetMetadata('responseMsg', '임시저장 편지 조회')
  async getLetterTmp(
    @User('user_no') userNo: number,
    @Param('letter_no') letterNo: number,
  ): Promise<{ letterTmp: LetterTmp }> {
    const letterTmp = await this.letterService.getLetterTmp(userNo, letterNo);
    return { letterTmp };
  }

  // 감동 메세지 보내기
  // POST /letter/thank
  @UseGuards(JwtAuthGuard)
  @Post('thank')
  @SetMetadata('responseMsg', '감동 메세지 보내기')
  async postThankMsg(
    @User('user_no') userNo: number,
    @Body() body: PostThankDto,
  ): Promise<{ result: number; msg: string }> {
    const { letterNo, thankMsg } = body;

    await this.letterService.postThankMsg(userNo, letterNo, thankMsg);

    return { result: 0, msg: '감동 메세지 보내기 성공' };
  }

  // 편지 삭제
  // DELETE /letter/list
  @UseGuards(JwtAuthGuard)
  @Delete('list')
  @SetMetadata('responseMsg', '편지 삭제')
  async deleteLetter(
    @User('user_no') userNo: number,
    @Body() body: DeleteLetterDto,
  ) {
    const { letterList } = body;
    console.log('🚀 ~ LetterController ~ body:', body);
    console.log('🚀 ~ LetterController ~ letterList:', letterList);

    const deleteLetter = await this.letterService.deleteLetter(
      userNo,
      letterList,
    );
    console.log('🚀 ~ LetterController ~ deleteLetter:', deleteLetter);

    return { deleteLetter };
  }
}
