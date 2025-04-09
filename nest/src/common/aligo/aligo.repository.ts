import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { AligoTemplate } from './interfaces/aligo-template.interface';

@Injectable()
export class AligoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTemplate(templateTitle: string): Promise<AligoTemplate> {
    const template = await this.prisma.tb_template.findFirst({
      where: { template_title: templateTitle },
      select: {
        template_no: true,
        template_code: true,
        template_title: true,
        template_msg: true,
        button_name: true,
        button_link: true,
        button_link_name: true,
        button_mo: true,
        button_pc: true,
      },
    });

    if (!template) {
      throw new BadRequestException('해당 템플릿을 찾을 수 없습니다');
    }

    return template;
  }
}
