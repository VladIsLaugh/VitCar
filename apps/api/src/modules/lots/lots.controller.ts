import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type {
  AvgPriceResponseDto,
  LotDetailDto,
  LotListResponseDto,
  LotLookupNotFoundDto,
  LotLookupResponseDto,
} from '@vitauto/shared-types';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS emitDecoratorMetadata requires runtime class for @Query() transform
import { AvgPriceQueryDto } from './dto/avg-price-query.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS emitDecoratorMetadata requires runtime class for @Query() transform
import { LotQueryDto } from './dto/lot-query.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS emitDecoratorMetadata requires runtime class for @Query() transform
import { LotLookupDto } from './dto/lot-lookup.dto';
import { LotsService } from './lots.service';

@SkipThrottle()
@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Get()
  async getLots(@Query() query: LotQueryDto): Promise<LotListResponseDto> {
    return this.lotsService.getLots(query);
  }

  @Get('avg-price')
  async getAvgPrice(@Query() query: AvgPriceQueryDto): Promise<AvgPriceResponseDto> {
    return this.lotsService.getAvgPrice(query.make, query.model, query.year);
  }

  @Get('lookup')
  async lookupLot(
    @Query() query: LotLookupDto,
  ): Promise<LotLookupResponseDto | LotLookupNotFoundDto> {
    if (!query.vin && !query.lotNumber) {
      throw new BadRequestException('At least one of vin or lotNumber is required');
    }
    return this.lotsService.lookupLot(query.vin, query.lotNumber);
  }

  @Get(':id')
  async getLotById(@Param('id') id: string): Promise<LotDetailDto> {
    return this.lotsService.getLotById(id);
  }
}
