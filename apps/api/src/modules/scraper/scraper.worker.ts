import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import type { Job } from 'bullmq';
import type { ScrapeMakeJobData } from './bidfax.scraper';
import { BidfaxScraperService } from './bidfax.scraper';

@Processor('scraper-queue', { concurrency: 1 })
export class ScraperWorker extends WorkerHost {
  private readonly logger = new Logger(ScraperWorker.name);

  constructor(private readonly scraperService: BidfaxScraperService) {
    super();
  }

  async process(job: Job<ScrapeMakeJobData>): Promise<{ newLots: number; skipped: number }> {
    const { makeSlug, modelSlug, maxPages } = job.data;
    try {
      const result = await this.scraperService.scrapeMakeModel(makeSlug, modelSlug, maxPages);
      this.logger.log(
        `Scraped ${result.newLots} new lots, skipped ${result.skipped} duplicates for ${makeSlug}/${modelSlug}`,
      );
      return result;
    } catch (err) {
      Sentry.captureException(err);
      this.logger.error(`Failed scraping ${makeSlug}/${modelSlug}: ${(err as Error).message}`);
      throw err;
    }
  }
}
