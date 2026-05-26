import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { FuelType, type VinDecodeResultDto } from '@vitauto/shared-types';

const NHTSA_URL = (vin: string) =>
  `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;

interface NhtsaResult {
  Variable: string;
  Value: string | null;
}

// NHTSA uses different strings across model years; pre-1996 vehicles often return
// non-standard variants, and some manufacturers (e.g. BMW) populate Series instead
// of Model. Map all known variants to our FuelType enum.
const FUEL_TYPE_MAP: Record<string, FuelType> = {
  Gasoline: FuelType.PETROL,
  Gas: FuelType.PETROL,
  'Flex Fuel Vehicle (FFV)': FuelType.PETROL,
  'Natural Gas': FuelType.PETROL,
  'Compressed Natural Gas (CNG)': FuelType.PETROL,
  'Liquefied Petroleum Gas (LPG)': FuelType.PETROL,
  Diesel: FuelType.DIESEL,
  Electric: FuelType.ELECTRIC,
  'Plug-in Hybrid/Electric Vehicle (PHEV)': FuelType.HYBRID,
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
    // NHTSA sometimes populates Series instead of Model (common for BMW, some European makes)
    const model = get('Model') || get('Series') || null;
    const yearRaw = get('Model Year');
    const year = yearRaw ? parseInt(yearRaw, 10) || null : null;

    if (!model) this.logger.warn(`NHTSA returned empty model for VIN ${vin}`);

    const nhtsaFuel = get('Fuel Type - Primary');
    if (!nhtsaFuel) this.logger.warn(`NHTSA returned empty fuel type for VIN ${vin}`);
    const fuelType = nhtsaFuel ? (FUEL_TYPE_MAP[nhtsaFuel] ?? null) : null;
    if (nhtsaFuel && !fuelType)
      this.logger.warn(`Unknown NHTSA fuel type "${nhtsaFuel}" for VIN ${vin}`);

    const batteryTo = get('Battery Energy (kWh) To');
    const batteryFrom = get('Battery Energy (kWh) From');
    const batteryKwh = parseFloat(batteryTo ?? batteryFrom ?? '') || null;

    return { vin, make, model, year, fuelType, batteryKwh };
  }
}
