import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  getUserById(id: string): User {
    return {
      id,
      name: '샘플 사용자',
    };
  }

  // 👉 유저 생성 로직
  createUser(createUserDto: CreateUserDto): User {
    const { name, email } = createUserDto;

    // 실제 DB 저장은 아직 안 하니까, 임시로 id 생성해서 반환
    return {
      id: 'fake-id-123',
      name,
    };
  }
}
