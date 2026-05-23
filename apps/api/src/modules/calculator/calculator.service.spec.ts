import { CalculationEngineService } from './calculation-engine.service';
import { AuctionCondition, AuctionSource, FuelType } from '@vitauto/shared-types';
import type { CalculationInputs, ExchangeRates } from '@vitauto/shared-types';
import type { SettingsSnapshot } from './calculation-engine.service';

// Seed data duplicated here so tests are hermetic
const COPART_BUYER_FEES = [
  { min: 0, max: 49, fee: 1 },
  { min: 50, max: 99, fee: 25 },
  { min: 100, max: 199, fee: 50 },
  { min: 200, max: 299, fee: 75 },
  { min: 300, max: 349, fee: 90 },
  { min: 350, max: 399, fee: 100 },
  { min: 400, max: 449, fee: 110 },
  { min: 450, max: 499, fee: 115 },
  { min: 500, max: 549, fee: 120 },
  { min: 550, max: 599, fee: 130 },
  { min: 600, max: 699, fee: 140 },
  { min: 700, max: 799, fee: 150 },
  { min: 800, max: 899, fee: 160 },
  { min: 900, max: 999, fee: 170 },
  { min: 1000, max: 1199, fee: 185 },
  { min: 1200, max: 1299, fee: 195 },
  { min: 1300, max: 1399, fee: 205 },
  { min: 1400, max: 1499, fee: 215 },
  { min: 1500, max: 1599, fee: 225 },
  { min: 1600, max: 1699, fee: 235 },
  { min: 1700, max: 1799, fee: 245 },
  { min: 1800, max: 1999, fee: 255 },
  { min: 2000, max: 2399, fee: 265 },
  { min: 2400, max: 2499, fee: 275 },
  { min: 2500, max: 2999, fee: 290 },
  { min: 3000, max: 3499, fee: 305 },
  { min: 3500, max: 3999, fee: 320 },
  { min: 4000, max: 4499, fee: 340 },
  { min: 4500, max: 4999, fee: 355 },
  { min: 5000, max: 5999, fee: 390 },
  { min: 6000, max: 6999, fee: 420 },
  { min: 7000, max: 7999, fee: 455 },
  { min: 8000, max: 9999, fee: 490 },
  { min: 10000, max: 11999, fee: 550 },
  { min: 12000, max: 13999, fee: 615 },
  { min: 14000, max: 14999, fee: 680 },
  { min: 15000, max: 19999, fee: 780 },
  { min: 20000, max: 29999, fee: 895 },
  { min: 30000, max: 49999, fee: 1025 },
  { min: 50000, max: null, feePercentage: 0.075 },
];

const COPART_PROXY_FEES = [
  { min: 0, max: 499, fee: 0 },
  { min: 500, max: 999, fee: 59 },
  { min: 1000, max: 1499, fee: 79 },
  { min: 1500, max: 1999, fee: 89 },
  { min: 2000, max: 3999, fee: 99 },
  { min: 4000, max: 5999, fee: 119 },
  { min: 6000, max: 7999, fee: 149 },
  { min: 8000, max: 9999, fee: 179 },
  { min: 10000, max: null, fee: 199 },
];

const SETTINGS: SettingsSnapshot = {
  AUCTION_FEES: {
    COPART_BUYER_FEES,
    COPART_PROXY_FEES,
    COPART_FIXED_FEES: { internetBidFee: 95, gatePass: 15, environmentalFee: 69 },
    IAAI_BUYER_FEES: COPART_BUYER_FEES, // simplified for non-IAAI tests
    IAAI_PROXY_FEES: COPART_PROXY_FEES,
    IAAI_FIXED_FEES: { processingFee: 79, gatePass: 15, environmentalFee: 20 },
  },
  LOGISTICS: {
    SEA_LOGISTIC: {
      CHI: { small: 900, big: 1166 },
      HOU: { small: 950, big: 1233 },
      LA: { small: 1450, big: 1900 },
      MIA: { small: 775, big: 1000 },
      NY: { small: 775, big: 1000 },
      SAV: { small: 750, big: 966 },
      SEATTLE: { small: 1900, big: 2300 },
    },
  },
  UKRAINE_DELIVERY: {
    UKRAINE_DELIVERY: {
      expeditor: 500,
      deliveryToUA: 850,
      terminalFees: 50,
      brokerFee: 150,
      deliveryToSTO: 150,
    },
  },
  COMPANY_FEE: { COMPANY_FEE: { serviceFee: 500, seaMarkup: 500 } },
  REGISTRATION: { REGISTRATION: { certification: 150, mreo: 30 } },
  CUSTOMS: {
    PENSION_FUND_THRESHOLDS: {
      low: { maxUAH: 549120, rate: 0.03 },
      mid: { maxUAH: 965120, rate: 0.04 },
      high: { rate: 0.05 },
    },
    PETROL_EXCISE: {
      tiers: [
        { maxCC: 1000, ratePerL: 50 },
        { maxCC: 1500, ratePerL: 75 },
        { maxCC: 2000, ratePerL: 100 },
        { maxCC: 3000, ratePerL: 150 },
        { maxCC: null, ratePerL: 200 },
      ],
    },
    DIESEL_EXCISE: {
      tiers: [
        { maxCC: 1500, ratePerL: 75 },
        { maxCC: 2500, ratePerL: 150 },
        { maxCC: null, ratePerL: 200 },
      ],
    },
    EV_EXCISE_RATE: { eurPerKwh: 1 },
    HYBRID_EXCISE: { eurFixed: 100 },
  },
};

const RATES: ExchangeRates = {
  usdUah: 41.5,
  eurUah: 44.82,
  eurUsd: 1.08,
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('CalculationEngineService', () => {
  let engine: CalculationEngineService;

  beforeEach(() => {
    engine = new CalculationEngineService();
    // Fix current year so tests are deterministic
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2026);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('Toyota Camry 2021 $8,500 Copart NY (petrol 2500cc, small)', () => {
    const inputs: CalculationInputs = {
      lotPrice: 8500,
      auctionSource: AuctionSource.COPART,
      auctionCondition: AuctionCondition.RUN_AND_DRIVE,
      usPort: 'NY',
      carSize: 'small',
      fuelType: FuelType.PETROL,
      year: 2021,
      engineVolume: 2500,
    };

    it('returns correct auction buyer fee', () => {
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.auctionBuyerFee).toBe(490); // $8500 → tier 8000-9999 → $490
    });

    it('returns correct auction proxy fee', () => {
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.auctionProxyFee).toBe(179); // $8500 → tier 8000-9999 → $179
    });

    it('returns correct fixed fees', () => {
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.auctionFixedFees).toBe(179); // 95 + 15 + 69
    });

    it('returns correct sea shipping', () => {
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.seaShipping).toBe(775); // NY small
    });

    it('returns correct customs duty (10%)', () => {
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.customsDuty).toBe(1000); // (8500+1500)*10%
    });

    it('returns correct customs excise', () => {
      // 2500cc → tier maxCC=3000 → 150 EUR/L; volume=2.5L; age=5y
      // excise_EUR = 150 × 2.5 × 5 = 1875; in USD = 1875 × 1.08 = 2025
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.customsExcise).toBe(2025);
    });

    it('returns correct VAT', () => {
      // 20% × (10000 + 1000 + 2025) = 20% × 13025 = 2605
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.customsVat).toBe(2605);
    });

    it('returns correct pension fund (3% tier)', () => {
      // carValueUah = 8500 × 41.5 = 352750 < 549120 → rate 3%
      // pensionFund = round(8500 × 0.03) = 255
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.pensionFund).toBe(255);
    });

    it('returns correct total cost', () => {
      const result = engine.calculate(inputs, SETTINGS, RATES);
      // 8500 + (490+179+179) + 775 + 1700 + (1000+2025+2605) + 255 + 180
      expect(result.totalCost).toBe(17888);
    });
  });

  describe('EV calculation', () => {
    const inputs: CalculationInputs = {
      lotPrice: 30000,
      auctionSource: AuctionSource.COPART,
      auctionCondition: AuctionCondition.RUN_AND_DRIVE,
      usPort: 'NY',
      carSize: 'small',
      fuelType: FuelType.ELECTRIC,
      year: 2023,
      engineVolume: 0,
      batteryCapacity: 75,
    };

    it('has 0% customs duty', () => {
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.customsDuty).toBe(0);
    });

    it('calculates EV excise as 75 EUR × 1.08', () => {
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.customsExcise).toBe(Math.round(75 * 1.08)); // 81
    });

    it('has 0 pension fund', () => {
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.pensionFund).toBe(0);
    });
  });

  describe('Hybrid calculation', () => {
    const inputs: CalculationInputs = {
      lotPrice: 15000,
      auctionSource: AuctionSource.COPART,
      auctionCondition: AuctionCondition.RUN_AND_DRIVE,
      usPort: 'HOU',
      carSize: 'small',
      fuelType: FuelType.HYBRID,
      year: 2020,
      engineVolume: 2500,
    };

    it('calculates fixed hybrid excise (100 EUR)', () => {
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.customsExcise).toBe(Math.round(100 * 1.08)); // 108
    });
  });

  describe('percentage buyer fee tier (≥$50k)', () => {
    it('applies 7.5% feePercentage for lot ≥ $50,000', () => {
      const inputs: CalculationInputs = {
        lotPrice: 60000,
        auctionSource: AuctionSource.COPART,
        auctionCondition: AuctionCondition.RUN_AND_DRIVE,
        usPort: 'LA',
        carSize: 'big',
        fuelType: FuelType.PETROL,
        year: 2022,
        engineVolume: 3000,
      };
      const result = engine.calculate(inputs, SETTINGS, RATES);
      expect(result.auctionBuyerFee).toBe(Math.round(60000 * 0.075)); // 4500
    });
  });
});
