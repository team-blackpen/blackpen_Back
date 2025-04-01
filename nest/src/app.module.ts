import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { QuoteModule } from './quote/quote.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, QuoteModule, UserModule],
})
export class AppModule {}
