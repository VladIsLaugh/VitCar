import type { OnApplicationBootstrap } from '@nestjs/common';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type {
  CalculationBreakdown,
  CalculationInputs,
  CalculationResultDto,
  ExchangeRates,
} from '@vitauto/shared-types';
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
export class CalculatorService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CalculatorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly exchangeRates: ExchangeRatesService,
    private readonly engine: CalculationEngineService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.prisma.calculationSettings.count().catch(() => 0);
    if (count === 0) {
      this.logger.warn(
        'CalculatorSettings table is empty — run: pnpm --filter=@vitauto/api db:seed'
      );
    } else {
      this.logger.log(`CalculatorSettings loaded: ${count} rows`);
    }
  }

  async calculate(inputs: CalculationInputs): Promise<CalculationResultDto> {
    const [settings, rates] = await Promise.all([this.getActiveSettings(), this.getRates()]);
    const bd = this.engine.calculate(inputs, settings, rates);
    return this.toResultDto(bd, inputs, settings, rates);
  }

  private toResultDto(
    bd: CalculationBreakdown,
    inputs: CalculationInputs,
    settings: SettingsSnapshot,
    rates: ExchangeRates
  ): CalculationResultDto {
    const ud = settings.UKRAINE_DELIVERY.UKRAINE_DELIVERY;
    const reg = settings.REGISTRATION.REGISTRATION;
    const currentYear = new Date().getFullYear();
    const carAge = Math.max(currentYear - inputs.year, 1);

    return {
      firstPayment: {
        lotPrice: bd.lotPrice,
        auctionFees: {
          buyerFee: bd.auctionBuyerFee,
          proxyFee: bd.auctionProxyFee,
          fixedFees: bd.auctionFixedFees,
          total: bd.totalAuctionFees,
        },
        landDelivery: 0,
        seaShipping: bd.seaShipping,
        bankFee: 0,
        total: bd.lotPrice + bd.totalAuctionFees + bd.seaShipping,
      },
      secondPayment: {
        expeditor: ud.expeditor,
        deliveryToUA: ud.deliveryToUA,
        terminalFees: ud.terminalFees,
        brokerFee: ud.brokerFee,
        deliveryToSTO: ud.deliveryToSTO,
        customsDuty: bd.customsDuty,
        excise: bd.customsExcise,
        vat: bd.customsVat,
        total: bd.ukraineDelivery + bd.totalCustoms,
      },
      thirdPayment: {
        repairPrice: 0,
        certification: reg.certification,
        pensionFund: bd.pensionFund,
        mreo: reg.mreo,
        total: bd.registration + bd.pensionFund,
      },
      totalUSD: bd.totalCost,
      totalUAH: Math.round(bd.totalCost * rates.usdUah),
      totalEUR: Math.round(bd.totalCost / rates.eurUsd),
      rates,
      customsValue: bd.lotPrice + 1500,
      carAge,
    };
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

  async findCalculationForPdf(
    id: string,
    requestingUserId: string | null
  ): Promise<{
    id: string;
    inputParams: CalculationInputs;
    result: CalculationBreakdown;
    createdAt: Date;
  }> {
    const row = await this.prisma.calculation.findUnique({ where: { id } });

    if (!row || (row.expiresAt && row.expiresAt < new Date())) {
      throw new NotFoundException('Calculation not found');
    }

    if (row.userId && row.userId !== requestingUserId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      id: row.id,
      inputParams: row.inputParams as unknown as CalculationInputs,
      result: row.result as unknown as CalculationBreakdown,
      createdAt: row.createdAt,
    };
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
    if (cached) {
      const parsed = JSON.parse(cached) as Record<string, unknown>;
      if (Object.keys(parsed).length > 0) return parsed as unknown as SettingsSnapshot;
    }

    const rows = await this.prisma.calculationSettings.findMany({ where: { isActive: true } });

    if (rows.length === 0) {
      throw new ServiceUnavailableException('Calculation settings not configured');
    }

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

  private getRates(): Promise<ExchangeRates> {
    return this.exchangeRates.getRates();
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
