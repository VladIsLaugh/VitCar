import type { FuelType } from '../calculator/enums';

export interface VinDecodeResultDto {
  vin: string;
  make: string | null;
  model: string | null;
  year: number | null;
  fuelType: FuelType | null;
  batteryKwh: number | null;
}
