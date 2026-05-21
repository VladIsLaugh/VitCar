import { Injectable, BadRequestException } from '@nestjs/common';
import type { AvgPriceResponseDto } from '@vitauto/shared-types';

interface StubEntry {
  make: string;
  model: string;
  year: number;
  avgPrice: number;
  sampleSize: number;
}

@Injectable()
export class LotsService {
  private readonly STUB_DATA: StubEntry[] = [
    { make: 'toyota', model: 'camry', year: 2021, avgPrice: 8500, sampleSize: 30 },
    { make: 'toyota', model: 'rav4', year: 2020, avgPrice: 11200, sampleSize: 18 },
    { make: 'honda', model: 'accord', year: 2019, avgPrice: 7800, sampleSize: 22 },
  ];

  async getAvgPrice(make: string, model: string, year: number): Promise<AvgPriceResponseDto> {
    if (!make || !model) {
      throw new BadRequestException('make and model are required');
    }

    const match = this.STUB_DATA.find(
      (d) => d.make === make.toLowerCase() && d.model === model.toLowerCase() && d.year === year
    );

    return {
      avgPrice: match?.avgPrice ?? null,
      sampleSize: match?.sampleSize ?? 0,
      currency: 'USD',
    };
  }
}
