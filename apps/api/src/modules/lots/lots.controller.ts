import { Controller, Get, Query, Inject } from '@nestjs/common';
import { LotsService } from './lots.service';
import type { AvgPriceQueryDto } from './dto/avg-price-query.dto';
import type { AvgPriceResponseDto } from '@vitauto/shared-types';

@Controller('lots')
export class LotsController {
  constructor(@Inject(LotsService) private readonly lotsService: LotsService) {}

  @Get('avg-price')
  async getAvgPrice(@Query() query: AvgPriceQueryDto): Promise<AvgPriceResponseDto> {
    return this.lotsService.getAvgPrice(query.make, query.model, query.year);
  }
}
