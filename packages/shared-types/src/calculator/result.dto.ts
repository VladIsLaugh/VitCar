import type { UsPort } from './enums';

export interface CalculationBreakdown {
  lotPrice: number;
  auctionBuyerFee: number;
  auctionProxyFee: number;
  auctionFixedFees: number;
  totalAuctionFees: number;
  seaShipping: number;
  ukraineDelivery: number;
  customsDuty: number;
  customsExcise: number;
  customsVat: number;
  totalCustoms: number;
  pensionFund: number;
  registration: number;
  totalCost: number;
}

export interface ExchangeRates {
  usdUah: number;
  eurUah: number;
  eurUsd: number;
  updatedAt: string;
}

export type FeeRow = {
  min: number;
  max: number;
  fee?: number;
  feePercentage?: number;
};

export interface CopartFixedFees {
  internetBidFee: number;
  gatePass: number;
  latePayment: number;
  environmentalFee: number;
}

export interface IaaiFixedFees {
  processingFee: number;
  destinationFee: number;
  gatePass: number;
  environmentalFee: number;
}

export interface UkraineDelivery {
  expeditor: number;
  deliveryToUA: number;
  terminalFees: number;
  brokerFee: number;
  deliveryToSTO: number;
}

export interface Registration {
  certification: number;
  mreo: number;
}

export interface PensionFundThresholds {
  low: { maxUAH: number; rate: number };
  mid: { maxUAH: number; rate: number };
  high: { rate: number };
}

export interface CompanyFee {
  serviceFee: number;
  seaMarkup: number;
}

export interface CalculationResultDto {
  firstPayment: {
    lotPrice: number;
    auctionFees: {
      buyerFee: number;
      proxyFee: number;
      fixedFees: number;
      total: number;
    };
    landDelivery: number;
    seaShipping: number;
    bankFee: number;
    total: number;
  };
  secondPayment: {
    expeditor: number;
    deliveryToUA: number;
    terminalFees: number;
    brokerFee: number;
    deliveryToSTO: number;
    customsDuty: number;
    excise: number;
    vat: number;
    total: number;
  };
  thirdPayment: {
    repairPrice: number;
    certification: number;
    pensionFund: number;
    mreo: number;
    total: number;
  };
  totalUSD: number;
  totalUAH: number;
  totalEUR: number;
  rates: {
    usdUah: number;
    eurUsd: number;
    ratesDate: string;
  };
  customsValue: number;
  carAge: number;
}

export interface CalculationSettingsSnapshot {
  AUCTION_FEES: {
    COPART_BUYER_FEES: FeeRow[];
    COPART_PROXY_FEES: FeeRow[];
    COPART_FIXED_FEES: CopartFixedFees;
    IAAI_BUYER_FEES: FeeRow[];
    IAAI_PROXY_FEES: FeeRow[];
    IAAI_FIXED_FEES: IaaiFixedFees;
  };
  SEA_LOGISTIC: Record<UsPort, { small: number; big: number }>;
  UKRAINE_DELIVERY: UkraineDelivery;
  REGISTRATION: Registration;
  PENSION_FUND_THRESHOLDS: PensionFundThresholds;
  COMPANY_FEE: CompanyFee;
}
