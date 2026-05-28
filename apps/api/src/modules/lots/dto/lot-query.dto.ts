import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AuctionSource, FuelType } from '@prisma/client';

export enum LotSortBy {
  SALE_DATE_DESC = 'saleDate_desc',
  SALE_DATE_ASC = 'saleDate_asc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  MILEAGE_ASC = 'mileage_asc',
}

export class LotQueryDto {
  @IsOptional()
  @IsString()
  makeId?: string;

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  yearFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  yearTo?: number;

  @IsOptional()
  @IsEnum(AuctionSource)
  source?: AuctionSource;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value : typeof value === 'string' ? [value] : undefined,
  )
  damageType?: string[];

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  priceFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  priceTo?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  mileageMax?: number;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsEnum(LotSortBy)
  sortBy?: LotSortBy = LotSortBy.SALE_DATE_DESC;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  limit?: number = 24;
}
