export type LotSortBy =
  | 'saleDate_desc'
  | 'saleDate_asc'
  | 'price_asc'
  | 'price_desc'
  | 'mileage_asc';

export interface LotFiltersDto {
  makeId?: string;
  modelId?: string;
  yearFrom?: number;
  yearTo?: number;
  source?: 'COPART' | 'IAAI';
  damageType?: string[];
  fuelType?: string;
  priceFrom?: number;
  priceTo?: number;
  mileageMax?: number;
  state?: string;
  saleStatus?: 'SOLD' | 'UNSOLD';
  sortBy?: LotSortBy;
  page?: number;
  limit?: number;
}
