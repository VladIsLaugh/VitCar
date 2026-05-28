import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get, UseGuards } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/scraper')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
export class ScraperController {
  constructor(
    @InjectQueue('scraper-queue') private readonly scraperQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  @Get('status')
  async getStatus() {
    const [waiting, active, failed, completed, totalLots, recentLots] = await Promise.all([
      this.scraperQueue.getWaitingCount(),
      this.scraperQueue.getActiveCount(),
      this.scraperQueue.getFailedCount(),
      this.scraperQueue.getCompletedCount(),
      this.prisma.lot.count(),
      this.prisma.lot.count({
        where: { scrapedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const completedJobs = completed > 0
      ? await this.scraperQueue.getJobs(['completed'], 0, 1, false)
      : [];
    const lastRunAt = completedJobs[0]?.finishedOn
      ? new Date(completedJobs[0].finishedOn).toISOString()
      : null;

    return {
      queueSize: waiting,
      activeJobs: active,
      failedJobs: failed,
      lastRunAt,
      totalLotsInDb: totalLots,
      lotsScrapedLast24h: recentLots,
    };
  }
}
