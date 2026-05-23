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
