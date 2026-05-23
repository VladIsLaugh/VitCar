import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { ExchangeRates } from '@vitauto/shared-types';
import type { RedisService } from '../redis/redis.service';

const REDIS_KEY = 'exchange:rates';
const NBU_URL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';

interface NbuRate {
  cc: string;
  rate: number;
  exchangedate: string;
}

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);

  constructor(private readonly redis: RedisService) {}

  async getCurrent(): Promise<ExchangeRates> {
    const cached = await this.redis.get(REDIS_KEY).catch(() => null);
    if (cached) return JSON.parse(cached) as ExchangeRates;

    return this.fetchAndCache();
  }

  async fetchAndCache(): Promise<ExchangeRates> {
    let rates: NbuRate[];
    try {
      const res = await fetch(NBU_URL, { signal: AbortSignal.timeout(5000) });
      rates = (await res.json()) as NbuRate[];
    } catch (err) {
      this.logger.error('NBU fetch failed', err);
      throw new ServiceUnavailableException('Exchange rates temporarily unavailable');
    }

    const usd = rates.find((r) => r.cc === 'USD');
    const eur = rates.find((r) => r.cc === 'EUR');

    if (!usd || !eur) {
      throw new ServiceUnavailableException('Exchange rates temporarily unavailable');
    }

    const payload: ExchangeRates = {
      usdUah: usd.rate,
      eurUah: eur.rate,
      eurUsd: eur.rate / usd.rate,
      updatedAt: new Date().toISOString(),
    };

    await this.redis.set(REDIS_KEY, JSON.stringify(payload), 'EX', 86400).catch(() => undefined);

    return payload;
  }

  async getFromCacheOnly(): Promise<ExchangeRates | null> {
    const cached = await this.redis.get(REDIS_KEY).catch(() => null);
    return cached ? (JSON.parse(cached) as ExchangeRates) : null;
  }
}
