import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { Queue } from 'bullmq';

const MAKES_WITH_MODELS: Array<{ makeSlug: string; models: string[] }> = [
  { makeSlug: 'toyota', models: ['camry', 'rav4', 'highlander', 'corolla', 'tacoma', 'prius', 'sienna'] },
  { makeSlug: 'honda', models: ['accord', 'cr-v', 'civic', 'pilot', 'odyssey', 'passport'] },
  { makeSlug: 'ford', models: ['f-150', 'explorer', 'escape', 'mustang', 'edge', 'expedition'] },
  { makeSlug: 'chevrolet', models: ['malibu', 'equinox', 'tahoe', 'silverado', 'traverse', 'suburban'] },
  { makeSlug: 'bmw', models: ['3-series', '5-series', 'x3', 'x5', 'x7', '7-series'] },
  { makeSlug: 'mercedes-benz', models: ['c-class', 'e-class', 'gle', 'glc', 's-class', 'gls'] },
  { makeSlug: 'lexus', models: ['rx', 'es', 'is', 'gx', 'nx', 'lx'] },
  { makeSlug: 'tesla', models: ['model-3', 'model-y', 'model-s', 'model-x'] },
  { makeSlug: 'kia', models: ['sorento', 'sportage', 'telluride', 'optima', 'stinger'] },
  { makeSlug: 'hyundai', models: ['sonata', 'tucson', 'santa-fe', 'elantra', 'palisade'] },
  { makeSlug: 'jeep', models: ['grand-cherokee', 'wrangler', 'cherokee', 'compass'] },
  { makeSlug: 'dodge', models: ['charger', 'challenger', 'durango', 'ram-1500'] },
  { makeSlug: 'subaru', models: ['outback', 'forester', 'impreza', 'legacy', 'crosstrek'] },
  { makeSlug: 'audi', models: ['a4', 'a6', 'q5', 'q7', 'q8'] },
  { makeSlug: 'volkswagen', models: ['jetta', 'passat', 'tiguan', 'atlas', 'golf'] },
  { makeSlug: 'mazda', models: ['cx-5', 'cx-9', 'mazda3', 'mazda6', 'cx-30'] },
  { makeSlug: 'nissan', models: ['altima', 'rogue', 'murano', 'pathfinder', 'frontier'] },
  { makeSlug: 'mitsubishi', models: ['outlander', 'eclipse-cross', 'galant'] },
  { makeSlug: 'volvo', models: ['xc90', 'xc60', 's90', 'v90'] },
  { makeSlug: 'ram', models: ['1500', '2500', '3500'] },
];

@Injectable()
export class ScraperCron {
  private readonly logger = new Logger(ScraperCron.name);

  constructor(@InjectQueue('scraper-queue') private readonly scraperQueue: Queue) {}

  @Cron('0 10 * * *', { timeZone: 'Europe/Kiev' })
  async handleDailyScrape() {
    const now = new Date();
    const kyivHour = Number(
      now.toLocaleString('en-US', { timeZone: 'Europe/Kiev', hour: 'numeric', hour12: false }),
    );

    if (kyivHour < 9 || kyivHour >= 23) {
      this.logger.warn(`Scraper cron skipped — outside allowed window (current Kyiv hour: ${kyivHour})`);
      return;
    }

    let jobCount = 0;
    for (const { makeSlug, models } of MAKES_WITH_MODELS) {
      for (const modelSlug of models) {
        await this.scraperQueue.add(
          'scrape-make',
          { makeSlug, modelSlug, maxPages: 5 },
          { jobId: `${makeSlug}-${modelSlug}-${now.toISOString().split('T')[0]}` },
        );
        jobCount++;
      }
    }

    this.logger.log(`Scraper cron fired: added ${jobCount} jobs to scraper-queue`);
  }
}
