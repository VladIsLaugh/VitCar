export enum AuctionCondition {
  RUN_AND_DRIVE = 'RUN_AND_DRIVE',
  ENGINE_START = 'ENGINE_START',
  STATIONARY = 'STATIONARY',
  ENHANCED_VEHICLE = 'ENHANCED_VEHICLE',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
}

export enum AuctionSource {
  COPART = 'COPART',
  IAAI = 'IAAI',
}

export type CarSize = 'small' | 'big';

export type UsPort = 'CHI' | 'HOU' | 'LA' | 'MIA' | 'NY' | 'SAV' | 'SEATLE';

export interface CalculationInputs {
  lotPrice: number;
  auctionSource: AuctionSource;
  auctionCondition: AuctionCondition;
  usPort: UsPort;
  carSize: CarSize;
  fuelType: FuelType;
  year: number;
  engineVolume: number; // cc, e.g. 2000 for 2.0L; use 0 for ELECTRIC
  batteryCapacity?: number; // kWh, required for ELECTRIC
}

export interface CalculationBreakdown {
  lotPrice: number;
  auctionBuyerFee: number;
  auctionProxyFee: number;
  auctionFixedFees: number;
  totalAuctionFees: number;
  seaShipping: number;
  ukraineDelivery: number;
  customsDuty: number;
  customsExcise: number; // USD
  customsVat: number;
  totalCustoms: number;
  pensionFund: number;
  registration: number;
  totalCost: number;
}

export interface ExchangeRates {
  usdUah: number;
  eurUah: number;
  eurUsd: number;
  updatedAt: string;
}
