import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LotsService } from './lots.service';

describe('LotsService', () => {
  let service: LotsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LotsService],
    }).compile();

    service = module.get(LotsService);
  });

  describe('getAvgPrice', () => {
    it('returns avg price for a known combination (case-insensitive)', async () => {
      const result = await service.getAvgPrice('Toyota', 'Camry', 2021);
      expect(result).toEqual({ avgPrice: 8500, sampleSize: 30, currency: 'USD' });
    });

    it('returns avg price for Toyota RAV4 2020', async () => {
      const result = await service.getAvgPrice('toyota', 'rav4', 2020);
      expect(result).toEqual({ avgPrice: 11200, sampleSize: 18, currency: 'USD' });
    });

    it('returns avg price for Honda Accord 2019', async () => {
      const result = await service.getAvgPrice('HONDA', 'ACCORD', 2019);
      expect(result).toEqual({ avgPrice: 7800, sampleSize: 22, currency: 'USD' });
    });

    it('returns null avgPrice and 0 sampleSize for unknown combination', async () => {
      const result = await service.getAvgPrice('BMW', 'X5', 2022);
      expect(result).toEqual({ avgPrice: null, sampleSize: 0, currency: 'USD' });
    });

    it('returns null for known make/model with wrong year', async () => {
      const result = await service.getAvgPrice('Toyota', 'Camry', 2019);
      expect(result).toEqual({ avgPrice: null, sampleSize: 0, currency: 'USD' });
    });

    it('throws BadRequestException when make is empty', async () => {
      await expect(service.getAvgPrice('', 'Camry', 2021)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when model is empty', async () => {
      await expect(service.getAvgPrice('Toyota', '', 2021)).rejects.toThrow(BadRequestException);
    });
  });
});
