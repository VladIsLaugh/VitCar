import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { ExchangeRatesService } from './exchange-rates.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { RedisService } from '../redis/redis.service';
import { RATES_REDIS_KEY } from './exchange-rates.service';

@Injectable()
export class NbuCron {
  private readonly logger = new Logger(NbuCron.name);

  constructor(
    private readonly exchangeRates: ExchangeRatesService,
    private readonly redis: RedisService
  ) {}

  @Cron('0 9 * * *', { timeZone: 'Europe/Kiev' })
  async refreshRates(): Promise<void> {
    try {
      await this.exchangeRates.fetchAndStore();
    } catch {
      // fetchAndStore already logs the warning; don't overwrite existing cache on failure
      this.logger.warn(`NBU cron: fetch failed, keeping existing ${RATES_REDIS_KEY} in Redis`);
    }
  }
}
