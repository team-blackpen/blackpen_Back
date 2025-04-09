import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LetterInfoDto {
  @IsString()
  recipient: string;

  @IsString()
  recipientPhone: string;

  @IsString()
  sender: string;

  @IsString()
  senderPhone: string;

  @IsNumber()
  reservationStatus: number;

  @IsOptional()
  @IsString()
  reservationDt: string | null;
}

export class CreateLetterDto {
  @IsNumber()
  letterNo: number;

  @IsNumber()
  postNo: number;

  @IsNumber()
  status: number;

  @IsNumber()
  stage: number;

  @IsString()
  letterContents: string;

  @IsNumber()
  fontNo: number;

  @IsArray()
  @IsString({ each: true })
  letterImg: string[];

  @ValidateNested()
  @Type(() => LetterInfoDto)
  info: LetterInfoDto;
}
