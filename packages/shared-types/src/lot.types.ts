export enum LotStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export enum LotCondition {
  NEW = 'new',
  USED = 'used',
  DAMAGED = 'damaged',
  PARTS_ONLY = 'parts_only',
}

export interface CarLot {
  id: string;
  title: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: LotCondition;
  status: LotStatus;
  startingPrice: number;
  currentBid: number | null;
  auctionEndsAt: string | null;
  images: string[];
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLotDto {
  title: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: LotCondition;
  startingPrice: number;
  auctionEndsAt?: string;
  images?: string[];
}

export interface LotFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  condition?: LotCondition;
  status?: LotStatus;
}
