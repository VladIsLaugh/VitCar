export interface LotMakeRef {
  id: string;
  name: string;
  slug: string;
}

export interface LotModelRef {
  id: string;
  name: string;
  slug: string;
}

export interface LotCardDto {
  id: string;
  source: 'COPART' | 'IAAI';
  lotNumber: string;
  vin: string | null;
  make: LotMakeRef;
  model: LotModelRef;
  year: number;
  bodyType: string | null;
  fuelType: string | null;
  mileage: number | null;
  mileageUnit: 'MILES' | 'KM';
  damageType: string | null;
  titleStatus: string | null;
  saleStatus: 'SOLD' | 'UNSOLD';
  finalBid: number | null;
  currency: string;
  saleDate: string | null;
  state: string | null;
  photoUrls: string[];
  externalUrl: string | null;
}

export interface LotDetailDto extends LotCardDto {
  engineCC: number | null;
  location: string | null;
  scrapedAt: string;
  avgPrice: number | null;
  avgPriceSampleSize: number;
  relatedLots: LotCardDto[];
}

export interface LotFacets {
  damageType: Array<{ value: string; count: number }>;
  source: Array<{ value: string; count: number }>;
  fuelType: Array<{ value: string; count: number }>;
}

export interface LotListResponseDto {
  items: LotCardDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: LotFacets;
}

export interface LotLookupResponseDto {
  found: true;
  lot: LotCardDto;
}

export interface LotLookupNotFoundDto {
  found: false;
  bidfaxUrl: string;
}

export interface MakeDto {
  id: string;
  name: string;
  slug: string;
  lotCount: number;
}

export interface ModelDto {
  id: string;
  name: string;
  slug: string;
  lotCount: number;
}
