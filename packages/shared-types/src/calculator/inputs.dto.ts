import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { AuctionCondition, AuctionSource, CarSize, FuelType } from './enums';

export class CalculationInputsDto {
  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsInt()
  @Min(2000)
  @Max(2030)
  year!: number;

  @IsEnum(FuelType)
  fuelType!: FuelType;

  @IsEnum(AuctionCondition)
  condition!: AuctionCondition;

  @IsEnum(AuctionSource)
  auctionSource!: AuctionSource;

  @IsString()
  usaState!: string;

  @IsEnum(CarSize)
  carSize!: CarSize;

  @IsNumber()
  @Min(0)
  lotPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  engineVolumeL?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  batteryKwh?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  mileage?: number;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  repairPrice?: number;
}
