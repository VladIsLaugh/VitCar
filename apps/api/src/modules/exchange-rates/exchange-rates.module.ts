import { Global, Module } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesController } from './exchange-rates.controller';
import { NbuCron } from './nbu.cron';

@Global()
@Module({
  providers: [ExchangeRatesService, NbuCron],
  controllers: [ExchangeRatesController],
  exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
