import { Controller, Get, Query, Inject } from '@nestjs/common';
import { LotsService } from './lots.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS emitDecoratorMetadata requires runtime class for @Query() transform
import { AvgPriceQueryDto } from './dto/avg-price-query.dto';
import type { AvgPriceResponseDto } from '@vitauto/shared-types';

@Controller('lots')
export class LotsController {
  constructor(@Inject(LotsService) private readonly lotsService: LotsService) {}

  @Get('avg-price')
  async getAvgPrice(@Query() query: AvgPriceQueryDto): Promise<AvgPriceResponseDto> {
    return this.lotsService.getAvgPrice(query.make, query.model, query.year);
  }
}
