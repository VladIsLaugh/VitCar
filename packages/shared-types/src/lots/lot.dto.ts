export interface LotCardDto {
  id: string;
  source: 'COPART' | 'IAAI';
  lotNumber: string;
  vin: string | null;
  make: { id: string; name: string; slug: string };
  model: { id: string; name: string; slug: string };
  year: number;
  bodyType: string | null;
  fuelType: string | null;
  damageType: string | null;
  mileage: number | null;
  mileageUnit: 'MILES' | 'KM';
  finalBid: number | null;
  currency: string;
  saleDate: string | null;
  state: string | null;
  photoUrls: string[];
  saleStatus: 'SOLD' | 'UNSOLD';
}

export interface LotDetailDto extends LotCardDto {
  titleStatus: string | null;
  engineCC: number | null;
  location: string | null;
  externalUrl: string | null;
  avgPrice: number | null;
  avgPriceSampleSize: number;
  relatedLots: LotCardDto[];
}

export interface LotFacetsDto {
  damageTypes: { value: string; count: number }[];
  sources: { value: 'COPART' | 'IAAI'; count: number }[];
  fuelTypes: { value: string | null; count: number }[];
}

// backward-compat alias
export type LotFacets = LotFacetsDto;

export interface LotListResponseDto {
  items: LotCardDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: LotFacetsDto;
}
