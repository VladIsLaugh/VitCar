import { Controller, Get, Query, ParseIntPipe, Inject } from '@nestjs/common';
import { LotsService } from './lots.service';
import type { AvgPriceResponseDto } from '@vitauto/shared-types';

@Controller('lots')
export class LotsController {
  constructor(@Inject(LotsService) private readonly lotsService: LotsService) {}

  @Get('avg-price')
  async getAvgPrice(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('year', ParseIntPipe) year: number
  ): Promise<AvgPriceResponseDto> {
    return this.lotsService.getAvgPrice(make, model, year);
  }
}
