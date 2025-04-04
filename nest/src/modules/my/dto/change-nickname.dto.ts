import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeNicknameDto {
  @IsNotEmpty()
  @IsString()
  nickname: string;
}
