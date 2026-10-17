import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}

export class UpdateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}
