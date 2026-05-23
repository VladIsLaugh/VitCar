import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { CalculationBreakdown, CalculationInputs, ExchangeRates } from '@vitauto/shared-types';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { PrismaService } from '../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { RedisService } from '../redis/redis.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { CalculationEngineService, SettingsSnapshot } from './calculation-engine.service';

const SETTINGS_CACHE_KEY = 'calculator:settings';

function omitCompanyFee<T extends Record<string, unknown>>(obj: T): Omit<T, 'COMPANY_FEE'> {
  const result = { ...obj };
  delete (result as Record<string, unknown>)['COMPANY_FEE'];
  return result as Omit<T, 'COMPANY_FEE'>;
}

@Injectable()
export class CalculatorService {
  private readonly logger = new Logger(CalculatorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly exchangeRates: ExchangeRatesService,
    private readonly engine: CalculationEngineService
  ) {}

  async calculate(inputs: CalculationInputs): Promise<CalculationBreakdown> {
    const [settings, rates] = await Promise.all([this.getActiveSettings(), this.getRates()]);
    return this.engine.calculate(inputs, settings, rates);
  }

  async save(
    inputParams: CalculationInputs,
    result: Record<string, unknown>,
    userId: string | null
  ): Promise<{ id: string; shareToken: string }> {
    const settings = await this.getActiveSettings();

    const clientSnapshot = omitCompanyFee(settings as unknown as Record<string, unknown>);

    const row = await this.prisma.calculation.create({
      data: {
        userId,
        inputParams: inputParams as object,
        result: result as object,
        settingsSnapshot: clientSnapshot as object,
        expiresAt: userId ? null : this.engine.guestExpiresAt(),
      },
      select: { id: true, shareToken: true },
    });

    return row;
  }

  async findById(id: string, requestingUserId: string | null): Promise<object> {
    const row = await this.prisma.calculation.findUnique({ where: { id } });

    if (!row || (row.expiresAt && row.expiresAt < new Date())) {
      throw new NotFoundException('Calculation not found');
    }

    if (row.userId && row.userId !== requestingUserId) {
      throw new ForbiddenException('Access denied');
    }

    return this.stripHiddenFields(row);
  }

  async findByShareToken(token: string): Promise<object> {
    const row = await this.prisma.calculation.findUnique({ where: { shareToken: token } });

    if (!row || (row.expiresAt && row.expiresAt < new Date())) {
      throw new NotFoundException('Calculation not found');
    }

    return this.stripHiddenFields(row);
  }

  async getActiveSettings(): Promise<SettingsSnapshot> {
    const cached = await this.redis.get(SETTINGS_CACHE_KEY).catch(() => null);
    if (cached) return JSON.parse(cached) as SettingsSnapshot;

    const rows = await this.prisma.calculationSettings.findMany({ where: { isActive: true } });

    const snapshot = rows.reduce<Record<string, Record<string, unknown>>>((acc, row) => {
      if (!acc[row.category]) acc[row.category] = {};
      acc[row.category]![row.key] = row.data;
      return acc;
    }, {});

    await this.redis
      .set(SETTINGS_CACHE_KEY, JSON.stringify(snapshot), 'EX', 3600)
      .catch(() => undefined);

    return snapshot as unknown as SettingsSnapshot;
  }

  private async getRates(): Promise<ExchangeRates> {
    const rates = await this.exchangeRates.getCurrent();
    if (!rates) throw new ServiceUnavailableException('Exchange rates temporarily unavailable');
    return rates;
  }

  private stripHiddenFields(row: object): object {
    const r = row as Record<string, unknown>;
    const snapshot = r['settingsSnapshot'] as Record<string, unknown> | undefined;
    if (snapshot) {
      return { ...r, settingsSnapshot: omitCompanyFee(snapshot) };
    }
    return r;
  }

  @Cron('0 3 * * *')
  async deleteExpiredCalculations() {
    const { count } = await this.prisma.calculation.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (count > 0) this.logger.log(`Deleted ${count} expired guest calculations`);
  }
}
