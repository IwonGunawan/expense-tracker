import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryExpenseDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}

export class QueryMonthlyDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}

export class CreateExpenseDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsDateString()
  date: string;
}

export class UpdateExpenseDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
