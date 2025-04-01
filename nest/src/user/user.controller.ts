// NestJS에서 컨트롤러는 라우팅을 담당하는 파일이야.
// @Controller 데코레이터를 이용해서 특정 경로로 들어오는 요청을 처리해!
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { UserParamDto } from './dto/user-param.dto';
import { CreateUserDto } from './dto/create-user.dto'; // ✅ 새로 만든 DTO
import { User } from './interfaces/user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUserById(@Param() params: UserParamDto): User {
    return this.userService.getUserById(params.id);
  }

  // 👉 POST /users 요청 처리 (유저 생성)
  @Post()
  createUser(@Body() createUserDto: CreateUserDto): User {
    // 요청된 name, email을 받아서 서비스로 넘김
    return this.userService.createUser(createUserDto);
  }
}
