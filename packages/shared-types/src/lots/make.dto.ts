import type { LotCardDto } from './lot.dto';

export interface MakeDto {
  id: string;
  name: string;
  slug: string;
  lotCount: number;
}

export interface ModelDto {
  id: string;
  makeId: string;
  name: string;
  slug: string;
  lotCount: number;
}

export interface LotLookupResponseDto {
  found: boolean;
  lot: LotCardDto | null;
  bidfaxUrl: string | null;
}

// backward-compat alias
export type LotLookupNotFoundDto = LotLookupResponseDto;
