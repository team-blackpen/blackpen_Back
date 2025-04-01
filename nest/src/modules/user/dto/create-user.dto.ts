import { IsString, IsEmail } from 'class-validator';

// 👉 POST 요청에서 유저를 생성할 때 요청되는 데이터 구조 정의
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
