import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// passport-jwt를 기반으로 동작하는 Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
