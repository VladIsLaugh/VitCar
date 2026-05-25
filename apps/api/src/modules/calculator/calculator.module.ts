import { Module } from '@nestjs/common';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { CalculationEngineService } from './calculation-engine.service';
import { CalculationsController, CalculatorDevController } from './calculator.controller';
import { CalculatorService } from './calculator.service';
import { PdfService } from './pdf/pdf.service';

@Module({
  imports: [ExchangeRatesModule],
  controllers: [CalculationsController, CalculatorDevController],
  providers: [CalculatorService, CalculationEngineService, PdfService],
  exports: [CalculatorService],
})
export class CalculatorModule {}
