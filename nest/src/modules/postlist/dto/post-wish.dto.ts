import { IsNumber } from 'class-validator';

export class PostWishDto {
  @IsNumber()
  postNo: number;
}
