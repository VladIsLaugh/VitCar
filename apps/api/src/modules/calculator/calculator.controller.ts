import { Controller, Get, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { PrismaService } from '../prisma/prisma.service';

@Controller('calculator')
export class CalculatorController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('settings')
  async getSettings() {
    if (process.env['APP_ENV'] !== 'dev') {
      throw new NotFoundException();
    }

    const rows = await this.prisma.calculationSettings.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    return {
      count: rows.length,
      settings: rows,
    };
  }
}
