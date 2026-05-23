import { Injectable } from '@nestjs/common';
import {
  AuctionSource,
  FuelType,
  type CalculationInputs,
  type CalculationBreakdown,
  type ExchangeRates,
} from '@vitauto/shared-types';

interface FeeRow {
  min: number;
  max: number | null;
  fee?: number;
  feePercentage?: number;
}

interface ExciseTier {
  maxCC: number | null;
  ratePerL: number;
}

export interface SettingsSnapshot {
  AUCTION_FEES: {
    COPART_BUYER_FEES: FeeRow[];
    COPART_PROXY_FEES: FeeRow[];
    COPART_FIXED_FEES: { internetBidFee: number; gatePass: number; environmentalFee: number };
    IAAI_BUYER_FEES: FeeRow[];
    IAAI_PROXY_FEES: FeeRow[];
    IAAI_FIXED_FEES: { processingFee: number; gatePass: number; environmentalFee: number };
  };
  LOGISTICS: {
    SEA_LOGISTIC: Record<string, { small: number; big: number }>;
  };
  UKRAINE_DELIVERY: {
    UKRAINE_DELIVERY: {
      expeditor: number;
      deliveryToUA: number;
      terminalFees: number;
      brokerFee: number;
      deliveryToSTO: number;
    };
  };
  COMPANY_FEE: {
    COMPANY_FEE: { serviceFee: number; seaMarkup: number };
  };
  REGISTRATION: {
    REGISTRATION: { certification: number; mreo: number };
  };
  CUSTOMS: {
    PENSION_FUND_THRESHOLDS: {
      low: { maxUAH: number; rate: number };
      mid: { maxUAH: number; rate: number };
      high: { rate: number };
    };
    PETROL_EXCISE: { tiers: ExciseTier[] };
    DIESEL_EXCISE: { tiers: ExciseTier[] };
    EV_EXCISE_RATE: { eurPerKwh: number };
    HYBRID_EXCISE: { eurFixed: number };
  };
}

const CIF_SURCHARGE = 1500;
const DUTY_RATE = 0.1;
const VAT_RATE = 0.2;
const GUEST_EXPIRY_DAYS = 7;

@Injectable()
export class CalculationEngineService {
  calculate(
    inputs: CalculationInputs,
    settings: SettingsSnapshot,
    rates: ExchangeRates
  ): CalculationBreakdown {
    const currentYear = new Date().getFullYear();
    const carAge = Math.max(currentYear - inputs.year, 1);

    const auctionBuyerFee = this.findFee(
      inputs.auctionSource === AuctionSource.COPART
        ? settings.AUCTION_FEES.COPART_BUYER_FEES
        : settings.AUCTION_FEES.IAAI_BUYER_FEES,
      inputs.lotPrice
    );

    const auctionProxyFee = this.findFee(
      inputs.auctionSource === AuctionSource.COPART
        ? settings.AUCTION_FEES.COPART_PROXY_FEES
        : settings.AUCTION_FEES.IAAI_PROXY_FEES,
      inputs.lotPrice
    );

    const auctionFixedFees =
      inputs.auctionSource === AuctionSource.COPART
        ? settings.AUCTION_FEES.COPART_FIXED_FEES.internetBidFee +
          settings.AUCTION_FEES.COPART_FIXED_FEES.gatePass +
          settings.AUCTION_FEES.COPART_FIXED_FEES.environmentalFee
        : settings.AUCTION_FEES.IAAI_FIXED_FEES.processingFee +
          settings.AUCTION_FEES.IAAI_FIXED_FEES.gatePass +
          settings.AUCTION_FEES.IAAI_FIXED_FEES.environmentalFee;

    const totalAuctionFees = auctionBuyerFee + auctionProxyFee + auctionFixedFees;

    const portData = settings.LOGISTICS.SEA_LOGISTIC[inputs.usPort];
    const seaShipping = (portData?.[inputs.carSize] ?? 0) as number;

    const ud = settings.UKRAINE_DELIVERY.UKRAINE_DELIVERY;
    const ukraineDelivery =
      ud.expeditor + ud.deliveryToUA + ud.terminalFees + ud.brokerFee + ud.deliveryToSTO;

    const cifBase = inputs.lotPrice + CIF_SURCHARGE;
    const customsDuty = inputs.fuelType === FuelType.ELECTRIC ? 0 : Math.round(cifBase * DUTY_RATE);

    const exciseEur = this.calcExcise(inputs, settings, carAge);
    const customsExcise = Math.round(exciseEur * rates.eurUsd);

    const customsVat = Math.round((cifBase + customsDuty + customsExcise) * VAT_RATE);
    const totalCustoms = customsDuty + customsExcise + customsVat;

    const pensionFund = this.calcPensionFund(inputs, settings, rates);

    const reg = settings.REGISTRATION.REGISTRATION;
    const registration = reg.certification + reg.mreo;

    const totalCost =
      inputs.lotPrice +
      totalAuctionFees +
      seaShipping +
      ukraineDelivery +
      totalCustoms +
      pensionFund +
      registration;

    return {
      lotPrice: inputs.lotPrice,
      auctionBuyerFee,
      auctionProxyFee,
      auctionFixedFees,
      totalAuctionFees,
      seaShipping,
      ukraineDelivery,
      customsDuty,
      customsExcise,
      customsVat,
      totalCustoms,
      pensionFund,
      registration,
      totalCost,
    };
  }

  guestExpiresAt(): Date {
    const d = new Date();
    d.setDate(d.getDate() + GUEST_EXPIRY_DAYS);
    return d;
  }

  private findFee(table: FeeRow[], price: number): number {
    const row = table.find((r) => price >= r.min && (r.max === null || price <= r.max));
    if (!row) return 0;
    if (row.feePercentage !== undefined) return Math.round(price * row.feePercentage);
    return row.fee ?? 0;
  }

  private calcExcise(
    inputs: CalculationInputs,
    settings: SettingsSnapshot,
    carAge: number
  ): number {
    const { fuelType, engineVolume, batteryCapacity } = inputs;

    switch (fuelType) {
      case FuelType.ELECTRIC:
        return (batteryCapacity ?? 0) * settings.CUSTOMS.EV_EXCISE_RATE.eurPerKwh;
      case FuelType.HYBRID:
        return settings.CUSTOMS.HYBRID_EXCISE.eurFixed;
      case FuelType.PETROL:
      case FuelType.DIESEL: {
        const tiers =
          fuelType === FuelType.PETROL
            ? settings.CUSTOMS.PETROL_EXCISE.tiers
            : settings.CUSTOMS.DIESEL_EXCISE.tiers;
        const tier = tiers.find((t) => t.maxCC === null || engineVolume <= t.maxCC);
        const ratePerL = tier?.ratePerL ?? 50;
        return ratePerL * (engineVolume / 1000) * carAge;
      }
    }
  }

  private calcPensionFund(
    inputs: CalculationInputs,
    settings: SettingsSnapshot,
    rates: ExchangeRates
  ): number {
    if (inputs.fuelType === FuelType.ELECTRIC) return 0;

    const thresholds = settings.CUSTOMS.PENSION_FUND_THRESHOLDS;
    const carValueUah = inputs.lotPrice * rates.usdUah;

    let rate: number;
    if (carValueUah <= thresholds.low.maxUAH) {
      rate = thresholds.low.rate;
    } else if (carValueUah <= thresholds.mid.maxUAH) {
      rate = thresholds.mid.rate;
    } else {
      rate = thresholds.high.rate;
    }

    return Math.round(inputs.lotPrice * rate);
  }
}
