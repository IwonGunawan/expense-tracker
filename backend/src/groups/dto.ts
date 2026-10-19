import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;
}

export class InviteUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username: string;
}

export class JoinGroupDto {
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  code: string;
}
