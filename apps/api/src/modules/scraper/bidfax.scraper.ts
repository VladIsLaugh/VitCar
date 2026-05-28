import { Injectable, Logger } from '@nestjs/common';

export interface ScrapeMakeJobData {
  makeSlug: string;
  modelSlug: string;
  maxPages: number;
}

export interface ScrapeResult {
  newLots: number;
  skipped: number;
}

@Injectable()
export class BidfaxScraperService {
  private readonly logger = new Logger(BidfaxScraperService.name);

  async scrapeMakeModel(makeSlug: string, modelSlug: string, maxPages: number): Promise<ScrapeResult> {
    this.logger.log(`Scraping ${makeSlug}/${modelSlug} up to ${maxPages} pages`);
    // Actual HTML parsing will be implemented in the bidfax scraper story.
    // For now, this is a no-op stub that returns zero new lots.
    return { newLots: 0, skipped: 0 };
  }
}
