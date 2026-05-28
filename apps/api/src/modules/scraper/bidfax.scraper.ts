import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as Sentry from '@sentry/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapeMakeJobData {
  makeSlug: string;
  modelSlug: string;
  maxPages: number;
}

export interface ScrapeResult {
  newLots: number;
  skipped: number;
  errors: number;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
];

const CUTOFF_DATE = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d;
};

@Injectable()
export class BidfaxScraperService {
  private readonly logger = new Logger(BidfaxScraperService.name);
  private robotsChecked = false;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  private async fetchPage(url: string, attempt = 1): Promise<string> {
    try {
      const { data } = await axios.get<string>(url, {
        headers: { 'User-Agent': this.getRandomUserAgent() },
        timeout: 15000,
        responseType: 'text',
      });
      return data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if ((status === 429 || status === 503) && attempt < 3) {
        await this.sleep(attempt * 5000);
        return this.fetchPage(url, attempt + 1);
      }
      throw err;
    }
  }

  private async checkRobots(makeSlug: string): Promise<void> {
    if (this.robotsChecked) return;
    this.robotsChecked = true;
    try {
      const robotsTxt = await this.fetchPage('https://bidfax.info/robots.txt');
      if (robotsTxt.includes(`Disallow: /${makeSlug}`)) {
        this.logger.warn(
          `robots.txt may disallow scraping /${makeSlug} — proceeding anyway (public historical data)`
        );
      }
    } catch {
      this.logger.warn('Could not fetch robots.txt');
    }
  }

  private validateVin(vin: string): boolean {
    return /^[A-Z0-9]{17}$/i.test(vin);
  }

  private parseFinalBid(raw: string): number | null {
    const cleaned = raw.replace(/[$,\s]/g, '');
    if (!cleaned || cleaned === 'N/A' || cleaned === '-') return null;
    const val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
  }

  private parseSaleDate(raw: string): Date | null {
    if (!raw) return null;
    // "May 14, 2024" format
    const longMatch = /([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/.exec(raw);
    if (longMatch) {
      const d = new Date(`${longMatch[1]} ${longMatch[2]}, ${longMatch[3]}`);
      return isNaN(d.getTime()) ? null : d;
    }
    // "05/14/2024" format
    const shortMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw.trim());
    if (shortMatch) {
      const d = new Date(`${shortMatch[3]}-${shortMatch[1]}-${shortMatch[2]}`);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  private parseLots(
    html: string,
    _makeSlug: string,
    _modelSlug: string
  ): Array<{
    lotNumber: string;
    vin: string | null;
    year: number | null;
    damageType: string | null;
    finalBid: number | null;
    saleDate: Date | null;
    state: string | null;
    photoUrls: string[];
    externalUrl: string | null;
    source: 'COPART' | 'IAAI';
  }> {
    const $ = cheerio.load(html);
    const lots: ReturnType<typeof this.parseLots> = [];

    // bidfax.info uses .lot-card or similar elements; adapt selectors as needed
    $('[data-lot], .lot-item, .car-item, article.lot').each((_, el) => {
      try {
        const $el = $(el);

        const lotNumber =
          $el.attr('data-lot') ??
          $el.find('[data-lot]').attr('data-lot') ??
          $el.find('.lot-number, .lot-num').text().trim();

        if (!lotNumber) return;

        const rawVin = $el.find('.vin, [class*="vin"]').text().trim();
        const vin = rawVin && this.validateVin(rawVin) ? rawVin.toUpperCase() : null;

        const yearText = $el.find('.year, [class*="year"]').text().trim();
        const year = parseInt(yearText, 10) || null;

        const damageType = $el.find('.damage, [class*="damage"]').text().trim() || null;

        const rawBid = $el
          .find('.bid, .price, [class*="bid"], [class*="price"]')
          .first()
          .text()
          .trim();
        const finalBid = this.parseFinalBid(rawBid);

        const rawDate = $el.find('.date, [class*="date"], time').first().text().trim();
        const saleDate = this.parseSaleDate(rawDate);

        const rawState = $el.find('.state, [class*="state"]').text().trim();
        const state =
          rawState && /^[A-Z]{2}$/.test(rawState.toUpperCase()) ? rawState.toUpperCase() : null;

        const photoUrls = $el
          .find('img[src]')
          .map((_, img) => $(img).attr('src') ?? '')
          .get()
          .filter(Boolean);

        const href = $el.find('a[href]').first().attr('href') ?? null;
        const externalUrl = href
          ? href.startsWith('http')
            ? href
            : `https://bidfax.info${href}`
          : null;

        // Determine source from URL or page content
        const pageText = $el.text().toLowerCase();
        const source: 'COPART' | 'IAAI' =
          pageText.includes('iaai') || (externalUrl?.includes('iaai') ?? false) ? 'IAAI' : 'COPART';

        lots.push({
          lotNumber,
          vin,
          year,
          damageType,
          finalBid,
          saleDate,
          state,
          photoUrls,
          externalUrl,
          source,
        });
      } catch (err) {
        this.logger.warn(`Failed to parse lot element: ${(err as Error).message}`);
      }
    });

    return lots;
  }

  async scrapeMakeModel(
    makeSlug: string,
    modelSlug: string,
    maxPages: number
  ): Promise<ScrapeResult> {
    this.logger.log(`Scraping bidfax.info/${makeSlug}/${modelSlug} up to ${maxPages} pages`);
    await this.checkRobots(makeSlug);

    const make = await this.prisma.make.findUnique({ where: { slug: makeSlug } });
    if (!make) {
      this.logger.warn(`Make not found for slug: ${makeSlug}`);
      return { newLots: 0, skipped: 0, errors: 0 };
    }

    const model = await this.prisma.model.findFirst({
      where: { makeId: make.id, slug: modelSlug },
    });
    if (!model) {
      this.logger.warn(`Model not found for slug: ${modelSlug} under make ${makeSlug}`);
      return { newLots: 0, skipped: 0, errors: 0 };
    }

    const result: ScrapeResult = { newLots: 0, skipped: 0, errors: 0 };
    const cutoff = CUTOFF_DATE();

    for (let page = 1; page <= maxPages; page++) {
      const url = `https://bidfax.info/${makeSlug}/${modelSlug}/?page=${page}`;
      let html: string;

      try {
        html = await this.fetchPage(url);
      } catch (err) {
        this.logger.error(`Failed to fetch page ${url}: ${(err as Error).message}`);
        Sentry.captureException(err, { extra: { url, page } });
        result.errors++;
        break;
      }

      const lots = this.parseLots(html, makeSlug, modelSlug);

      if (lots.length === 0) {
        if (page > 1) {
          Sentry.captureMessage(`Scraper: zero lots on page ${page} of ${url}`, {
            level: 'warning',
            extra: { htmlSnippet: html.slice(0, 500) },
          });
        }
        break;
      }

      let hitCutoff = false;
      for (const lot of lots) {
        if (lot.year === null) {
          result.errors++;
          continue;
        }

        if (lot.saleDate && lot.saleDate < cutoff) {
          hitCutoff = true;
          continue;
        }

        const exists = await this.prisma.lot.findFirst({
          where: { lotNumber: lot.lotNumber, source: lot.source },
          select: { id: true },
        });

        if (exists) {
          result.skipped++;
          continue;
        }

        try {
          await this.prisma.lot.create({
            data: {
              source: lot.source,
              lotNumber: lot.lotNumber,
              vin: lot.vin,
              makeId: make.id,
              modelId: model.id,
              year: lot.year,
              damageType: lot.damageType,
              finalBid: lot.finalBid,
              saleDate: lot.saleDate,
              state: lot.state,
              photoUrls: lot.photoUrls,
              externalUrl: lot.externalUrl,
              saleStatus: 'SOLD',
            },
          });
          result.newLots++;
        } catch (err) {
          this.logger.error(`Failed to insert lot ${lot.lotNumber}: ${(err as Error).message}`);
          result.errors++;
        }
      }

      if (hitCutoff) break;

      // Rate limit: 2-3 seconds between requests
      if (page < maxPages) {
        await this.sleep(2000 + Math.random() * 1000);
      }
    }

    this.logger.log(
      `Scrape complete: ${result.newLots} new, ${result.skipped} skipped, ${result.errors} errors`
    );
    return result;
  }
}
