import { Module } from '@nestjs/common';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { CalculationEngineService } from './calculation-engine.service';
import { CalculationsController, CalculatorDevController } from './calculator.controller';
import { CalculatorService } from './calculator.service';

@Module({
  imports: [ExchangeRatesModule],
  controllers: [CalculationsController, CalculatorDevController],
  providers: [CalculatorService, CalculationEngineService],
  exports: [CalculatorService],
})
export class CalculatorModule {}
