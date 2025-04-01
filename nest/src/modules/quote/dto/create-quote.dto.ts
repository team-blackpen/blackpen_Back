import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  quote: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @IsOptional()
  status?: number;
}
