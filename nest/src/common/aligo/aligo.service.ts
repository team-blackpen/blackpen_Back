import { Injectable, BadRequestException } from '@nestjs/common';

import { AligoRepository } from './aligo.repository';
import * as aligoapi from 'aligoapi';

import { AligoTemplate } from './interfaces/aligo-template.interface';

@Injectable()
export class AligoService {
  constructor(private readonly aligoRepository: AligoRepository) {}

  async sendAlimtalk({
    senderName,
    recipientName,
    recipientPhone,
    letterUrl,
    sendDate,
  }: {
    senderName: string;
    recipientName: string;
    recipientPhone: string;
    letterUrl: string;
    sendDate?: string;
  }): Promise<void> {
    const authData = {
      apikey: process.env.ALIGOAPIKEY,
      userid: process.env.ALIGOUSERID,
    };

    // 1. 토큰 발급
    const objToken = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: {
        type: 's',
        time: 60,
      },
    };

    const tokenRes = await aligoapi.token(objToken, authData);
    console.log('🚀 ~ AligoService ~ tokenRes:', tokenRes);

    if (tokenRes.code !== 0) {
      throw new BadRequestException('알림톡 토큰 발급 실패');
    }

    authData['token'] = tokenRes.token;

    // 2. 템플릿 가져오기
    const template: AligoTemplate =
      await this.aligoRepository.getTemplate('전하다 테스트2');

    // 3. 템플릿 메시지 가공
    let message = template.template_msg ?? '';

    message = message.replace(/#{발신인명}/g, senderName);
    message = message.replace(/#{수신인명}/g, recipientName);
    message = message.replace(/#{URL링크}/g, letterUrl);

    const buttonInfo = JSON.stringify({
      button: [
        {
          name: template.button_name,
          linkType: template.button_link,
          linkTypeName: template.button_link_name,
          linkMo: template.button_mo,
          linkPc: template.button_pc,
        },
      ],
    });

    // 4. 알림톡 발송
    const sendPayLoad: {
      headers: { [key: string]: string };
      body: { [key: string]: any };
    } = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: {
        senderkey: process.env.ALIGOSENDERKEY,
        tpl_code: template.template_code,
        sender: process.env.ALIGOSENDERPHONE,
        receiver_1: recipientPhone,
        recvname_1: recipientName,
        subject_1: template.template_title,
        message_1: message,
        button_1: buttonInfo,
      },
    };

    if (sendDate) {
      sendPayLoad.body.senddate = sendDate;
    }

    const sendRes = await aligoapi.alimtalkSend(sendPayLoad, authData);

    console.log('🚀 ~ AligoService ~ sendRes:', sendRes);

    if (sendRes.code !== 0) {
      throw new BadRequestException('알림톡 발송 실패');
    }
  }
}
