import { ServiceUnavailableException } from '@nestjs/common';
import { FuelType } from '@vitauto/shared-types';
import { VehiclesService } from './vehicles.service';

function nhtsaResponse(fields: Record<string, string | null>) {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue({
      Results: Object.entries(fields).map(([Variable, Value]) => ({ Variable, Value })),
    }),
  };
}

describe('VehiclesService', () => {
  let svc: VehiclesService;
  let globalFetch: typeof global.fetch;

  beforeEach(() => {
    svc = new VehiclesService();
    globalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = globalFetch;
    jest.restoreAllMocks();
  });

  it('returns batteryKwh for a known Tesla VIN', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      nhtsaResponse({
        Make: 'TESLA',
        Model: 'Model 3',
        'Model Year': '2022',
        'Fuel Type - Primary': 'Electric',
        'Battery Energy (kWh) From': '60',
        'Battery Energy (kWh) To': '82',
      })
    ) as never;

    const result = await svc.decodeVin('5YJ3E1EA1NF000001');

    expect(result.make).toBe('TESLA');
    expect(result.model).toBe('Model 3');
    expect(result.year).toBe(2022);
    expect(result.fuelType).toBe(FuelType.ELECTRIC);
    expect(result.batteryKwh).toBe(82); // To value takes precedence
  });

  it('returns batteryKwh from From when To is absent', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      nhtsaResponse({
        Make: 'TESLA',
        Model: 'Model S',
        'Model Year': '2019',
        'Fuel Type - Primary': 'Electric',
        'Battery Energy (kWh) From': '100',
        'Battery Energy (kWh) To': null,
      })
    ) as never;

    const result = await svc.decodeVin('5YJSA1E26JF000001');

    expect(result.batteryKwh).toBe(100);
  });

  it('returns batteryKwh: null and fuelType: PETROL for non-EV (Toyota Camry)', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      nhtsaResponse({
        Make: 'TOYOTA',
        Model: 'Camry',
        'Model Year': '2021',
        'Fuel Type - Primary': 'Gasoline',
        'Battery Energy (kWh) From': null,
        'Battery Energy (kWh) To': null,
      })
    ) as never;

    const result = await svc.decodeVin('4T1B11HK5JU000001');

    expect(result.fuelType).toBe(FuelType.PETROL);
    expect(result.batteryKwh).toBeNull();
  });

  it('returns all nulls except vin for unknown VIN', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      nhtsaResponse({
        Make: null,
        Model: null,
        'Model Year': null,
        'Fuel Type - Primary': null,
        'Battery Energy (kWh) From': null,
        'Battery Energy (kWh) To': null,
      })
    ) as never;

    const result = await svc.decodeVin('00000000000000000');

    expect(result.vin).toBe('00000000000000000');
    expect(result.make).toBeNull();
    expect(result.model).toBeNull();
    expect(result.year).toBeNull();
    expect(result.fuelType).toBeNull();
    expect(result.batteryKwh).toBeNull();
  });

  it('throws ServiceUnavailableException on NHTSA timeout', async () => {
    global.fetch = jest.fn().mockRejectedValue(new DOMException('timeout', 'AbortError')) as never;

    await expect(svc.decodeVin('5YJ3E1EA1NF000001')).rejects.toBeInstanceOf(
      ServiceUnavailableException
    );
  });

  it('throws ServiceUnavailableException on NHTSA non-200 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as never;

    await expect(svc.decodeVin('5YJ3E1EA1NF000001')).rejects.toBeInstanceOf(
      ServiceUnavailableException
    );
  });
});
