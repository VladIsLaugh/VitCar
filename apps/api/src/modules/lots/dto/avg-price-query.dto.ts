import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AvgPriceQueryDto {
  @IsNotEmpty({ message: 'make is required' })
  @IsString()
  make!: string;

  @IsNotEmpty({ message: 'model is required' })
  @IsString()
  model!: string;

  @IsInt({ message: 'year must be a valid integer' })
  @Min(1900)
  @Type(() => Number)
  year!: number;
}
