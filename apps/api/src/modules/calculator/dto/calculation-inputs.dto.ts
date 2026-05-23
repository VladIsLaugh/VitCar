import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';
import { AuctionCondition, AuctionSource, FuelType } from '@vitauto/shared-types';
import type { CarSize, UsPort, CalculationInputs } from '@vitauto/shared-types';

export class CalculationInputsDto implements CalculationInputs {
  @IsNumber()
  @IsPositive()
  lotPrice!: number;

  @IsEnum(AuctionSource)
  auctionSource!: AuctionSource;

  @IsEnum(AuctionCondition)
  auctionCondition!: AuctionCondition;

  @IsEnum(['CHI', 'HOU', 'LA', 'MIA', 'NY', 'SAV', 'SEATLE'])
  usPort!: UsPort;

  @IsEnum(['small', 'big'])
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
