import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { FuelType, type VinDecodeResultDto } from '@vitauto/shared-types';

const NHTSA_URL = (vin: string) =>
  `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;

interface NhtsaResult {
  Variable: string;
  Value: string | null;
}

const FUEL_TYPE_MAP: Record<string, FuelType> = {
  Gasoline: FuelType.PETROL,
  Diesel: FuelType.DIESEL,
  Electric: FuelType.ELECTRIC,
  Hybrid: FuelType.HYBRID,
};

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  async decodeVin(vin: string): Promise<VinDecodeResultDto> {
    let results: NhtsaResult[];
    try {
      const res = await fetch(NHTSA_URL(vin), { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`NHTSA responded ${res.status}`);
      const body = (await res.json()) as { Results: NhtsaResult[] };
      results = body.Results;
    } catch (err) {
      this.logger.warn('NHTSA fetch failed', err);
      throw new ServiceUnavailableException('Vehicle data temporarily unavailable');
    }

    const get = (variable: string) => results.find((r) => r.Variable === variable)?.Value ?? null;

    const make = get('Make') || null;
    const model = get('Model') || null;
    const yearRaw = get('Model Year');
    const year = yearRaw ? parseInt(yearRaw, 10) || null : null;

    const nhtsaFuel = get('Fuel Type - Primary');
    const fuelType = nhtsaFuel ? (FUEL_TYPE_MAP[nhtsaFuel] ?? null) : null;

    const batteryTo = get('Battery Energy (kWh) To');
    const batteryFrom = get('Battery Energy (kWh) From');
    const batteryKwh = parseFloat(batteryTo ?? batteryFrom ?? '') || null;

    return { vin, make, model, year, fuelType, batteryKwh };
  }
}
