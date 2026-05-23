import React from 'react';
import { Injectable } from '@nestjs/common';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { CalculatorService } from '../calculator.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { ExchangeRatesService } from '../../exchange-rates/exchange-rates.service';
import { CalculationReport } from './templates/CalculationReport';

@Injectable()
export class PdfService {
  constructor(
    private readonly calculatorService: CalculatorService,
    private readonly exchangeRates: ExchangeRatesService
  ) {}

  async generate(id: string, lang: 'uk' | 'en', userId: string | null): Promise<Buffer> {
    const [calc, rates] = await Promise.all([
      this.calculatorService.findCalculationForPdf(id, userId),
      this.exchangeRates.getRates(),
    ]);

    const element = React.createElement(CalculationReport, {
      id: calc.id,
      inputs: calc.inputParams,
      result: calc.result,
      rates,
      createdAt: calc.createdAt,
      lang,
    });

    return renderToBuffer(element as React.ReactElement<DocumentProps>) as Promise<Buffer>;
  }
}
