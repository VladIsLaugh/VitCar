import type { OnModuleInit } from '@nestjs/common';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { ExchangeRates } from '@vitauto/shared-types';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { RedisService } from '../redis/redis.service';

export const RATES_REDIS_KEY = 'exchange:rates';
export const NBU_URL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
const REDIS_TTL_SECONDS = 90000; // 25 hours — covers next day's cron if slightly late

interface NbuEntry {
  r030: number;
  rate: number;
  exchangedate: string;
}

@Injectable()
export class ExchangeRatesService implements OnModuleInit {
  readonly logger = new Logger(ExchangeRatesService.name);

  constructor(private readonly redis: RedisService) {}

  async onModuleInit(): Promise<void> {
    const cached = await this.redis.get(RATES_REDIS_KEY).catch(() => null);
    if (!cached) {
      this.logger.warn('No cached exchange rates on startup — fetching from NBU now');
      await this.fetchAndStore().catch((err: unknown) => {
        this.logger.warn('Bootstrap NBU fetch failed — will retry on first request', err);
      });
    }
  }

  async getRates(): Promise<ExchangeRates> {
    const cached = await this.redis.get(RATES_REDIS_KEY).catch(() => null);
    if (cached) {
      try {
        return JSON.parse(cached) as ExchangeRates;
      } catch {
        this.logger.warn('Cached exchange rates are malformed — refetching from NBU');
      }
    }

    return this.fetchAndStore();
  }

  async fetchAndStore(): Promise<ExchangeRates> {
    let entries: NbuEntry[];
    try {
      const res = await fetch(NBU_URL, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`NBU responded ${res.status}`);
      entries = (await res.json()) as NbuEntry[];
    } catch (err) {
      this.logger.warn('NBU fetch failed', err);
      throw new ServiceUnavailableException('Exchange rates temporarily unavailable');
    }

    const usd = entries.find((r) => r.r030 === 840);
    const eur = entries.find((r) => r.r030 === 978);

    if (!usd || !eur) {
      throw new ServiceUnavailableException('Exchange rates temporarily unavailable');
    }

    const [day, month, year] = usd.exchangedate.split('.');
    const ratesDate = `${year}-${month}-${day}`;

    const payload: ExchangeRates = {
      usdUah: usd.rate,
      eurUsd: eur.rate / usd.rate,
      ratesDate,
    };

    await this.redis
      .set(RATES_REDIS_KEY, JSON.stringify(payload), 'EX', REDIS_TTL_SECONDS)
      .catch(() => undefined);

    this.logger.log(`Exchange rates updated: 1 USD = ${usd.rate} UAH`);

    return payload;
  }

  async getFromCacheOnly(): Promise<ExchangeRates | null> {
    const cached = await this.redis.get(RATES_REDIS_KEY).catch(() => null);
    if (!cached) return null;
    try {
      return JSON.parse(cached) as ExchangeRates;
    } catch {
      return null;
    }
  }
}
