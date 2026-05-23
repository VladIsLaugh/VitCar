import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { ExchangeRatesService } from './exchange-rates.service';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRates: ExchangeRatesService) {}

  @Get('current')
  async getCurrent() {
    const rates = await this.exchangeRates.getFromCacheOnly();
    if (!rates) {
      throw new ServiceUnavailableException('Exchange rates temporarily unavailable');
    }
    return rates;
  }
}
