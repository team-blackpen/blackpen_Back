import { Module } from '@nestjs/common';
import { AligoTestController } from './aligo-test.controller';
import { AligoService } from '@/common/aligo/aligo.service';
import { AligoRepository } from '@/common/aligo/aligo.repository';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [AligoTestController],
  providers: [AligoService, AligoRepository, PrismaService],
})
export class AligoTestModule {}
