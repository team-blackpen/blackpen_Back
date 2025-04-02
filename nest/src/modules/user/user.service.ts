import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByNo(user_no: number) {
    const user = await this.prisma.tb_user.findUnique({
      where: { user_no },
      include: {
        tb_user_profile: true, // 프로필 정보도 함께 조회
      },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    return {
      user_no: user.user_no,
      social_id: user.social_id,
      login_type: user.login_type,
      nickname: user.tb_user_profile?.nickname,
      profile_img: user.tb_user_profile?.user_img_url,
      email: user.tb_user_profile?.email,
    };
  }
}
