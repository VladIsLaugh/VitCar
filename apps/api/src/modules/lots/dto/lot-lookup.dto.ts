import { IsOptional, IsString } from 'class-validator';

export class LotLookupDto {
  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  lotNumber?: string;
}
