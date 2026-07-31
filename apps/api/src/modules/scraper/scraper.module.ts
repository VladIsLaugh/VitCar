import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BidfaxScraperService } from './bidfax.scraper';
import { ScraperController } from './scraper.controller';
import { ScraperCron } from './scraper.cron';
import { ScraperWorker } from './scraper.worker';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'scraper-queue',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5 * 60 * 1000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
  ],
  providers: [BidfaxScraperService, ScraperWorker, ScraperCron],
  controllers: [ScraperController],
})
export class ScraperModule {}
