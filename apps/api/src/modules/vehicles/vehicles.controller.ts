import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('vin/:vin')
  decodeVin(@Param('vin') vin: string) {
    const upper = vin.toUpperCase();
    if (upper.length !== 17) {
      throw new BadRequestException('Invalid VIN: must be exactly 17 characters');
    }
    if (/[IOQ]/.test(upper)) {
      throw new BadRequestException(
        'Invalid VIN: must not contain the letters I, O, or Q (per ISO 3779)'
      );
    }
    if (!/^[A-Z0-9]{17}$/.test(upper)) {
      throw new BadRequestException(
        'Invalid VIN: must contain only alphanumeric characters (A–Z, 0–9)'
      );
    }
    return this.vehiclesService.decodeVin(upper);
  }
}
