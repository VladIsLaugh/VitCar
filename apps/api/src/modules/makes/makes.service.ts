import { Injectable } from '@nestjs/common';
import type { MakeDto, ModelDto } from '@vitauto/shared-types';
import type { PrismaService } from '../prisma/prisma.service';
import type { RedisService } from '../redis/redis.service';

@Injectable()
export class MakesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async getMakes(): Promise<MakeDto[]> {
    const cacheKey = 'makes:all';
    const cached = await this.redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached) as MakeDto[];

    const makes = await this.prisma.make.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { lots: { where: { saleStatus: 'SOLD' } } } },
      },
      orderBy: { name: 'asc' },
    });

    const result: MakeDto[] = makes.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      lotCount: m._count.lots,
    }));

    await this.redis.setex(cacheKey, 86400, JSON.stringify(result)).catch(() => null);
    return result;
  }

  async getModelsForMake(makeId: string): Promise<ModelDto[]> {
    const cacheKey = `makes:${makeId}:models`;
    const cached = await this.redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached) as ModelDto[];

    const models = await this.prisma.model.findMany({
      where: { makeId },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { lots: { where: { saleStatus: 'SOLD' } } } },
      },
      orderBy: { name: 'asc' },
    });

    const result: ModelDto[] = models.map((m) => ({
      id: m.id,
      makeId,
      name: m.name,
      slug: m.slug,
      lotCount: m._count.lots,
    }));

    await this.redis.setex(cacheKey, 86400, JSON.stringify(result)).catch(() => null);
    return result;
  }
}
