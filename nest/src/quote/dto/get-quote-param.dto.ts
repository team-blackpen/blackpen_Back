import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetQuoteParamDto {
  @Type(() => Number) // 👈 string → number 자동 변환
  @IsInt()
  quote_no: number;
}
