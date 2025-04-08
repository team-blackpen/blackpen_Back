import { IsNumber } from 'class-validator';

export class PostThankDto {
  @IsNumber()
  letterNo: number;

  @IsNumber()
  thankMsg: number;
}
