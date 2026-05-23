import { ServiceUnavailableException } from '@nestjs/common';
import { ExchangeRatesService, NBU_URL, RATES_REDIS_KEY } from './exchange-rates.service';

const CACHED_RATES = {
  usdUah: 41.5,
  eurUsd: 1.085,
  ratesDate: '2026-05-15',
};

const NBU_RESPONSE = [
  { r030: 840, cc: 'USD', rate: 41.5, exchangedate: '15.05.2026' },
  { r030: 978, cc: 'EUR', rate: 45.03, exchangedate: '15.05.2026' },
];

function makeRedis(cached: string | null) {
  return {
    get: jest.fn().mockResolvedValue(cached),
    set: jest.fn().mockResolvedValue('OK'),
  };
}

function makeService(redis: ReturnType<typeof makeRedis>) {
  const svc = new ExchangeRatesService(redis as never);
  return svc;
}

describe('ExchangeRatesService', () => {
  let globalFetch: typeof global.fetch;

  beforeEach(() => {
    globalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = globalFetch;
    jest.restoreAllMocks();
  });

  describe('getRates()', () => {
    it('returns rates from Redis when available', async () => {
      const redis = makeRedis(JSON.stringify(CACHED_RATES));
      const svc = makeService(redis);

      const result = await svc.getRates();

      expect(result).toEqual(CACHED_RATES);
      expect(redis.get).toHaveBeenCalledWith(RATES_REDIS_KEY);
    });

    it('falls back to live NBU fetch when Redis is empty', async () => {
      const redis = makeRedis(null);
      const svc = makeService(redis);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(NBU_RESPONSE),
      }) as never;

      const result = await svc.getRates();

      expect(result.usdUah).toBe(41.5);
      expect(result.ratesDate).toBe('2026-05-15');
      expect(global.fetch).toHaveBeenCalledWith(
        NBU_URL,
        expect.objectContaining({ signal: expect.anything() })
      );
    });

    it('throws ServiceUnavailableException when Redis empty and NBU fails', async () => {
      const redis = makeRedis(null);
      const svc = makeService(redis);

      global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as never;

      await expect(svc.getRates()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('fetchAndStore()', () => {
    it('parses NBU response and stores correct payload', async () => {
      const redis = makeRedis(null);
      const svc = makeService(redis);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(NBU_RESPONSE),
      }) as never;

      const result = await svc.fetchAndStore();

      expect(result.usdUah).toBe(41.5);
      expect(result.eurUsd).toBeCloseTo(45.03 / 41.5, 5);
      expect(result.ratesDate).toBe('2026-05-15');
      expect(redis.set).toHaveBeenCalledWith(
        RATES_REDIS_KEY,
        expect.stringContaining('"usdUah":41.5'),
        'EX',
        90000
      );
    });

    it('does not overwrite Redis when NBU API returns error status', async () => {
      const redis = makeRedis(JSON.stringify(CACHED_RATES));
      const svc = makeService(redis);

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: jest.fn(),
      }) as never;

      await expect(svc.fetchAndStore()).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(redis.set).not.toHaveBeenCalled();
    });

    it('throws ServiceUnavailableException when NBU response missing USD or EUR', async () => {
      const redis = makeRedis(null);
      const svc = makeService(redis);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue([{ r030: 840, cc: 'USD', rate: 41.5, exchangedate: '15.05.2026' }]),
      }) as never;

      await expect(svc.fetchAndStore()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('getFromCacheOnly()', () => {
    it('returns null when cache is empty', async () => {
      const redis = makeRedis(null);
      const svc = makeService(redis);

      await expect(svc.getFromCacheOnly()).resolves.toBeNull();
    });

    it('returns parsed rates when cache has data', async () => {
      const redis = makeRedis(JSON.stringify(CACHED_RATES));
      const svc = makeService(redis);

      await expect(svc.getFromCacheOnly()).resolves.toEqual(CACHED_RATES);
    });
  });
});
