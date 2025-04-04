import { IsNumber, IsOptional } from 'class-validator';

export class VisitLogDto {
  @IsOptional()
  @IsNumber()
  userNo?: number;

  @IsNumber()
  chCd: number;

  @IsNumber()
  pathCd: number;
}
