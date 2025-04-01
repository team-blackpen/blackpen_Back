import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { GetQuoteParamDto } from './dto/get-quote-param.dto';
import { Quote } from './interfaces/quote.interface';

@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get()
  async getQuotes(): Promise<Quote[]> {
    return this.quoteService.getAllQuotes();
  }

  @Get(':quote_no')
  async getQuoteById(@Param() params: GetQuoteParamDto): Promise<Quote> {
    return this.quoteService.getQuoteById(params.quote_no);
  }

  @Post()
  async createQuote(@Body() body: CreateQuoteDto): Promise<Quote> {
    return this.quoteService.createQuote(body);
  }
}
