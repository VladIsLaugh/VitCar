import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';
import { AuctionCondition, AuctionSource, CarSize, FuelType, UsPort } from './enums';

export interface CalculationInputs {
  lotPrice: number;
  auctionSource: AuctionSource;
  auctionCondition: AuctionCondition;
  usPort: UsPort;
  carSize: CarSize;
  fuelType: FuelType;
  year: number;
  engineVolume: number;
  batteryCapacity?: number;
}

export class CalculationInputsDto implements CalculationInputs {
  @IsNumber()
  @IsPositive()
  lotPrice!: number;

  @IsEnum(AuctionSource)
  auctionSource!: AuctionSource;

  @IsEnum(AuctionCondition)
  auctionCondition!: AuctionCondition;

  @IsEnum(UsPort)
  usPort!: UsPort;

  @IsEnum(CarSize)
  carSize!: CarSize;

  @IsEnum(FuelType)
  fuelType!: FuelType;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year!: number;

  @IsInt()
  @Min(0)
  engineVolume!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  batteryCapacity?: number;
}
