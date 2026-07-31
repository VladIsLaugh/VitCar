import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { ExchangeRatesService } from './exchange-rates.service';

@Injectable()
export class NbuCron {
  private readonly logger = new Logger(NbuCron.name);

  constructor(private readonly exchangeRates: ExchangeRatesService) {}

  @Cron('0 9 * * *', { timeZone: 'Europe/Kiev' })
  async refreshRates(): Promise<void> {
    try {
      await this.exchangeRates.fetchAndStore();
    } catch {
      // fetchAndStore() already logged the warning — existing cache is preserved
    }
  }
}
