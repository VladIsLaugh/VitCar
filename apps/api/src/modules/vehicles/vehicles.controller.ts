import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS DI requires value import
import { VehiclesService } from './vehicles.service';

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('vin/:vin')
  decodeVin(@Param('vin') vin: string) {
    const upper = vin.toUpperCase();
    if (!VIN_REGEX.test(upper)) {
      throw new BadRequestException('Invalid VIN: must be exactly 17 alphanumeric characters');
    }
    return this.vehiclesService.decodeVin(upper);
  }
}
