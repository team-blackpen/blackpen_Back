import { Module } from '@nestjs/common';
import { MainService } from './main.service';
import { MainController } from './main.controller';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule], // ✅ 반드시 추가되어야 함
  controllers: [MainController],
  providers: [MainService],
})
export class MainModule {}
