import { IsNumber } from 'class-validator';

export class GiftLogDto {
  @IsNumber()
  giftPrice: number;
}
