import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { SaleStatus } from '@prisma/client';
import * as crypto from 'crypto';
import type {
  AvgPriceResponseDto,
  LotCardDto,
  LotDetailDto,
  LotFacets,
  LotListResponseDto,
  LotLookupNotFoundDto,
  LotLookupResponseDto,
} from '@vitauto/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import type { LotQueryDto } from './dto/lot-query.dto';
import { LotSortBy } from './dto/lot-query.dto';

const LOT_CARD_INCLUDE = {
  make: { select: { id: true, name: true, slug: true } },
  model: { select: { id: true, name: true, slug: true } },
} as const;

type LotWithRefs = Prisma.LotGetPayload<{ include: typeof LOT_CARD_INCLUDE }>;

function toLotCard(lot: LotWithRefs): LotCardDto {
  return {
    id: lot.id,
    source: lot.source,
    lotNumber: lot.lotNumber,
    vin: lot.vin,
    make: lot.make,
    model: lot.model,
    year: lot.year,
    bodyType: lot.bodyType,
    fuelType: lot.fuelType,
    mileage: lot.mileage,
    mileageUnit: lot.mileageUnit,
    damageType: lot.damageType,
    saleStatus: lot.saleStatus,
    finalBid: lot.finalBid,
    currency: lot.currency,
    saleDate: lot.saleDate?.toISOString() ?? null,
    state: lot.state,
    photoUrls: lot.photoUrls,
  };
}

function buildOrderBy(sortBy: LotSortBy): Prisma.LotOrderByWithRelationInput {
  const map: Record<LotSortBy, Prisma.LotOrderByWithRelationInput> = {
    [LotSortBy.SALE_DATE_DESC]: { saleDate: 'desc' },
    [LotSortBy.SALE_DATE_ASC]: { saleDate: 'asc' },
    [LotSortBy.PRICE_ASC]: { finalBid: 'asc' },
    [LotSortBy.PRICE_DESC]: { finalBid: 'desc' },
    [LotSortBy.MILEAGE_ASC]: { mileage: 'asc' },
  };
  return map[sortBy] ?? { saleDate: 'desc' };
}

function getSaleDateGte(range: string): Date | undefined {
  const now = new Date();
  switch (range) {
    case 'week': {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case 'month': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
    case 'threeMonths': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return d;
    }
    case 'year': {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return d;
    }
    default:
      return undefined;
  }
}

@Injectable()
export class LotsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService
  ) {}

  async getLots(query: LotQueryDto): Promise<LotListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const sortBy = query.sortBy ?? LotSortBy.SALE_DATE_DESC;

    const cacheKey = `lots:${crypto
      .createHash('md5')
      .update(JSON.stringify({ ...query, page, limit }))
      .digest('hex')}`;
    const cached = await this.redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached) as LotListResponseDto;

    const saleDateGte = query.saleDateRange ? getSaleDateGte(query.saleDateRange) : undefined;

    const where: Prisma.LotWhereInput = {
      ...(query.makeId && { makeId: query.makeId }),
      ...(query.modelId && { modelId: query.modelId }),
      ...((query.yearFrom ?? query.yearTo) && {
        year: { gte: query.yearFrom, lte: query.yearTo },
      }),
      ...((query.priceFrom ?? query.priceTo) && {
        finalBid: { gte: query.priceFrom, lte: query.priceTo },
      }),
      ...(query.source && { source: query.source }),
      ...(query.damageType?.length && { damageType: { in: query.damageType } }),
      ...(query.fuelType && { fuelType: query.fuelType }),
      ...(query.mileageMax && { mileage: { lte: query.mileageMax } }),
      ...(query.state && { state: query.state }),
      ...(saleDateGte && { saleDate: { gte: saleDateGte } }),
      saleStatus: SaleStatus.SOLD,
    };

    const [items, total, damageTypeCounts, sourceCounts, fuelTypeCounts] = await Promise.all([
      this.prisma.lot.findMany({
        where,
        include: LOT_CARD_INCLUDE,
        orderBy: buildOrderBy(sortBy),
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.lot.count({ where }),
      this.prisma.lot.groupBy({
        by: ['damageType'],
        where: { ...where, damageType: undefined },
        _count: { _all: true },
        orderBy: { _count: { damageType: 'desc' } },
      }),
      this.prisma.lot.groupBy({
        by: ['source'],
        where: { ...where, source: undefined },
        _count: { _all: true },
      }),
      this.prisma.lot.groupBy({
        by: ['fuelType'],
        where: { ...where, fuelType: undefined },
        _count: { _all: true },
      }),
    ]);

    const facets: LotFacets = {
      damageTypes: damageTypeCounts
        .filter((r) => r.damageType !== null)
        .map((r) => ({ value: r.damageType!, count: r._count._all })),
      sources: sourceCounts.map((r) => ({ value: r.source, count: r._count._all })),
      fuelTypes: fuelTypeCounts
        .filter((r) => r.fuelType !== null)
        .map((r) => ({ value: r.fuelType!, count: r._count._all })),
    };

    const result: LotListResponseDto = {
      items: items.map(toLotCard),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      facets,
    };

    await this.redis.setex(cacheKey, 600, JSON.stringify(result)).catch(() => null);
    return result;
  }

  async getLotById(id: string): Promise<LotDetailDto> {
    const lot = await this.prisma.lot.findUnique({
      where: { id },
      include: LOT_CARD_INCLUDE,
    });

    if (!lot) throw new NotFoundException(`Lot ${id} not found`);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [avgResult, relatedLots] = await Promise.all([
      this.prisma.lot.aggregate({
        where: {
          makeId: lot.makeId,
          modelId: lot.modelId,
          year: { gte: lot.year - 2, lte: lot.year + 2 },
          saleStatus: SaleStatus.SOLD,
          saleDate: { gte: sixMonthsAgo },
          id: { not: lot.id },
        },
        _avg: { finalBid: true },
        _count: { _all: true },
      }),
      this.prisma.lot.findMany({
        where: {
          makeId: lot.makeId,
          modelId: lot.modelId,
          id: { not: lot.id },
          saleStatus: SaleStatus.SOLD,
        },
        include: LOT_CARD_INCLUDE,
        orderBy: { saleDate: 'desc' },
        take: 4,
      }),
    ]);

    return {
      ...toLotCard(lot),
      titleStatus: lot.titleStatus,
      engineCC: lot.engineCC,
      location: lot.location,
      externalUrl: lot.externalUrl,
      avgPrice: avgResult._avg.finalBid ? Number(avgResult._avg.finalBid) : null,
      avgPriceSampleSize: avgResult._count._all,
      relatedLots: relatedLots.map(toLotCard),
    };
  }

  async getAvgPrice(make: string, model: string, year: number): Promise<AvgPriceResponseDto> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await this.prisma.lot.aggregate({
      where: {
        make: { name: { equals: make, mode: 'insensitive' } },
        model: { name: { equals: model, mode: 'insensitive' } },
        year,
        saleStatus: SaleStatus.SOLD,
        saleDate: { gte: sixMonthsAgo },
      },
      _avg: { finalBid: true },
      _count: { _all: true },
    });

    return {
      avgPrice: result._avg.finalBid ?? null,
      sampleSize: result._count._all,
      currency: 'USD',
    };
  }

  async lookupLot(
    vin?: string,
    lotNumber?: string
  ): Promise<LotLookupResponseDto | LotLookupNotFoundDto> {
    const lot = await this.prisma.lot.findFirst({
      where: {
        OR: [...(vin ? [{ vin }] : []), ...(lotNumber ? [{ lotNumber }] : [])],
      },
      include: LOT_CARD_INCLUDE,
    });

    if (lot) return { found: true, lot: toLotCard(lot), bidfaxUrl: null };

    const query = vin ?? lotNumber ?? '';
    return {
      found: false,
      lot: null,
      bidfaxUrl: `https://bidfax.info/search/?q=${encodeURIComponent(query)}`,
    };
  }
}
