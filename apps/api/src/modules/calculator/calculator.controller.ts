import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { CalculatorService } from './calculator.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS emitDecoratorMetadata needs value imports for @Body() validation
import { CalculationInputsDto } from './dto/calculation-inputs.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS emitDecoratorMetadata needs value imports for @Body() validation
import { SaveCalculationDto } from './dto/save-calculation.dto';

import { OptionalAuthGuard } from './guards/optional-auth.guard';

@Controller('calculations')
export class CalculationsController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  calculate(@Body() dto: CalculationInputsDto) {
    return this.calculatorService.calculate(dto);
  }

  @Post('save')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalAuthGuard)
  save(@Body() dto: SaveCalculationDto, @CurrentUser() user: AuthUser | undefined) {
    return this.calculatorService.save(dto.inputParams, dto.result, user?.userId ?? null);
  }

  @Get('share/:token')
  findByShareToken(@Param('token') token: string) {
    return this.calculatorService.findByShareToken(token);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findById(@Param('id') id: string, @CurrentUser() user: AuthUser | undefined) {
    return this.calculatorService.findById(id, user?.userId ?? null);
  }
}

// Dev-only endpoint for QA seed verification
@Controller('calculator')
export class CalculatorDevController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Get('settings')
  async getSettings() {
    if (process.env['APP_ENV'] !== 'dev') {
      throw new NotFoundException();
    }
    const settings = await this.calculatorService.getActiveSettings();
    const rows = Object.entries(settings).flatMap(([category, keys]) =>
      Object.entries(keys as Record<string, unknown>).map(([key, data]) => ({
        category,
        key,
        data,
      }))
    );
    return { count: rows.length, settings: rows };
  }
}
