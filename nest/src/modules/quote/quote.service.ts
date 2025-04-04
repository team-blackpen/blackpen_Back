import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Quote } from './interfaces/quote.interface';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuoteService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllQuotes(): Promise<Quote[]> {
    // return this.prisma.tb_quote.findMany();

    const result = await this.prisma.tb_quote.findMany();

    return result.map((q) => ({
      quote_no: q.quote_no,
      author: q.author ?? '작자 미상', // null이면 '작자 미상'
      quote: q.quote ?? '', // null이면 빈 문자열
      category: q.category,
      status: q.status ?? 0, // null이면 0
    }));
  }

  async getQuoteById(quote_no: number): Promise<Quote> {
    const quote = await this.prisma.tb_quote.findUnique({
      where: { quote_no },
    });

    if (!quote) {
      throw new NotFoundException('해당 quote를 찾을 수 없습니다');
    }

    return {
      quote_no: quote.quote_no,
      author: quote.author ?? '작자 미상',
      quote: quote.quote,
      category: quote.category,
      status: quote.status,
    };
  }

  async createQuote(data: CreateQuoteDto): Promise<Quote> {
    const newQuote = await this.prisma.tb_quote.create({
      data: {
        quote: data.quote,
        author: data.author ?? '작자 미상',
        category: data.category,
        status: data.status,
      },
    });

    return {
      quote_no: newQuote.quote_no,
      quote: newQuote.quote,
      author: newQuote.author ?? '작자 미상',
      category: newQuote.category,
      status: newQuote.status,
    };
  }
}
