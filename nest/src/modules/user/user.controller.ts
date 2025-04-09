import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // JWT 토큰이 있어야 접근 가능한 라우트
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const user_no = req.user.user_no; // JWT에서 추출된 사용자 번호
    return this.userService.getUserByNo(user_no);
  }
}
