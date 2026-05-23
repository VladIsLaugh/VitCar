import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FuelType, AuctionSource, AuctionCondition, UsPort, CarSize } from '@vitauto/shared-types';
import { PdfService } from './pdf.service';

jest.mock('@react-pdf/renderer', () => ({
  renderToBuffer: jest.fn().mockResolvedValue(Buffer.from('%PDF-mock')),
  Document: 'Document',
  Page: 'Page',
  Text: 'Text',
  View: 'View',
  StyleSheet: { create: (s: unknown) => s },
}));

const MOCK_INPUTS = {
  lotPrice: 5000,
  auctionSource: AuctionSource.COPART,
  auctionCondition: AuctionCondition.RUN_AND_DRIVE,
  usPort: UsPort.NY,
  carSize: CarSize.SMALL,
  fuelType: FuelType.PETROL,
  year: 2019,
  engineVolume: 2000,
};

const MOCK_RESULT = {
  lotPrice: 5000,
  auctionBuyerFee: 400,
  auctionProxyFee: 100,
  auctionFixedFees: 89,
  totalAuctionFees: 589,
  seaShipping: 1200,
  ukraineDelivery: 800,
  customsDuty: 650,
  customsExcise: 900,
  customsVat: 1430,
  totalCustoms: 2980,
  pensionFund: 200,
  registration: 250,
  totalCost: 11019,
};

const MOCK_RATES = {
  usdUah: 41.5,
  eurUsd: 1.08,
  ratesDate: '2026-05-15',
};

function buildService(overrides?: {
  calculationResult?: object | Error;
  ratesResult?: object | Error;
}) {
  const calcResult = overrides?.calculationResult;
  const ratesResult = overrides?.ratesResult;

  const mockCalculatorService = {
    findCalculationForPdf:
      calcResult instanceof Error
        ? jest.fn().mockRejectedValue(calcResult)
        : jest.fn().mockResolvedValue(
            calcResult ?? {
              id: 'calc-1',
              inputParams: MOCK_INPUTS,
              result: MOCK_RESULT,
              createdAt: new Date('2026-05-15'),
            }
          ),
  };

  const mockExchangeRates = {
    getRates:
      ratesResult instanceof Error
        ? jest.fn().mockRejectedValue(ratesResult)
        : jest.fn().mockResolvedValue(ratesResult ?? MOCK_RATES),
  };

  const svc = new PdfService(mockCalculatorService as never, mockExchangeRates as never);

  return { svc, mockCalculatorService, mockExchangeRates };
}

describe('PdfService', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns a Buffer starting with %PDF for a valid calculation', async () => {
    const { svc } = buildService();
    const buf = await svc.generate('calc-1', 'uk', null);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.toString()).toContain('%PDF');
  });

  it('calls renderToBuffer with the correct lang (uk)', async () => {
    const { svc } = buildService();
    const { renderToBuffer } = jest.requireMock<{ renderToBuffer: jest.Mock }>(
      '@react-pdf/renderer'
    );
    await svc.generate('calc-1', 'uk', null);
    expect(renderToBuffer).toHaveBeenCalledTimes(1);
  });

  it('calls renderToBuffer with the correct lang (en)', async () => {
    const { svc } = buildService();
    const { renderToBuffer } = jest.requireMock<{ renderToBuffer: jest.Mock }>(
      '@react-pdf/renderer'
    );
    await svc.generate('calc-1', 'en', null);
    expect(renderToBuffer).toHaveBeenCalledTimes(1);
  });

  it('calls findCalculationForPdf with the given userId', async () => {
    const { svc, mockCalculatorService } = buildService();
    await svc.generate('calc-1', 'uk', 'user-42');
    expect(mockCalculatorService.findCalculationForPdf).toHaveBeenCalledWith('calc-1', 'user-42');
  });

  it('propagates NotFoundException from calculator service (404)', async () => {
    const { svc } = buildService({
      calculationResult: new NotFoundException('Calculation not found'),
    });
    await expect(svc.generate('missing', 'uk', null)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('propagates ForbiddenException from calculator service (403)', async () => {
    const { svc } = buildService({ calculationResult: new ForbiddenException('Access denied') });
    await expect(svc.generate('calc-1', 'uk', 'wrong-user')).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });
});
