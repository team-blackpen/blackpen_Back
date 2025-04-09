import { Controller, Get, Query } from '@nestjs/common';
import { AligoService } from '@/common/aligo/aligo.service';

@Controller('aligo-test')
export class AligoTestController {
  constructor(private readonly aligoService: AligoService) {}

  @Get('send')
  async sendTestMessage(
    @Query('sender') sender: string,
    @Query('recipient') recipient: string,
    @Query('phone') phone: string,
  ) {
    const letterUrl = `https://jeonhada.com`; // 테스트용 링크

    await this.aligoService.sendAlimtalk({
      senderName: sender,
      recipientName: recipient,
      recipientPhone: phone,
      letterUrl,
    });

    return { msg: '알림톡 테스트 발송 완료' };
  }
}
