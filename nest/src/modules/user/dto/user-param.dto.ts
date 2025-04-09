// ❗ 아래처럼 정확히 export 되어 있어야 함!
import { IsString } from 'class-validator';

export class UserParamDto {
  @IsString()
  id: string;
}
