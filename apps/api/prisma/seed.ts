import { AuctionSource, MileageUnit, Prisma, PrismaClient, SaleStatus } from '@prisma/client';
import {
  COPART_BUYER_FEES,
  COPART_PROXY_FEES,
  COPART_FIXED_FEES,
  IAAI_BUYER_FEES,
  IAAI_PROXY_FEES,
  IAAI_FIXED_FEES,
  SEA_LOGISTIC,
  UKRAINE_DELIVERY,
  COMPANY_FEE,
  REGISTRATION,
  PENSION_FUND_THRESHOLDS,
  PETROL_EXCISE,
  DIESEL_EXCISE,
  EV_EXCISE_RATE,
  HYBRID_EXCISE,
} from './seed-data/calculator.constants';

const prisma = new PrismaClient();

const EFFECTIVE_FROM = new Date('2026-01-01');

const MAKES_SEED = [
  { name: 'Toyota', slug: 'toyota', models: ['Camry', 'RAV4', 'Highlander', 'Corolla', 'Tacoma', 'Prius', 'Sienna'] },
  { name: 'Honda', slug: 'honda', models: ['Accord', 'CR-V', 'Civic', 'Pilot', 'Odyssey', 'Passport'] },
  { name: 'Ford', slug: 'ford', models: ['F-150', 'Explorer', 'Escape', 'Mustang', 'Edge', 'Expedition'] },
  { name: 'Chevrolet', slug: 'chevrolet', models: ['Malibu', 'Equinox', 'Tahoe', 'Silverado', 'Traverse', 'Suburban'] },
  { name: 'BMW', slug: 'bmw', models: ['3 Series', '5 Series', 'X3', 'X5', 'X7', '7 Series'] },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz', models: ['C-Class', 'E-Class', 'GLE', 'GLC', 'S-Class', 'GLS'] },
  { name: 'Lexus', slug: 'lexus', models: ['RX', 'ES', 'IS', 'GX', 'NX', 'LX'] },
  { name: 'Tesla', slug: 'tesla', models: ['Model 3', 'Model Y', 'Model S', 'Model X'] },
  { name: 'Kia', slug: 'kia', models: ['Sorento', 'Sportage', 'Telluride', 'Optima', 'Stinger'] },
  { name: 'Hyundai', slug: 'hyundai', models: ['Sonata', 'Tucson', 'Santa Fe', 'Elantra', 'Palisade'] },
  { name: 'Jeep', slug: 'jeep', models: ['Grand Cherokee', 'Wrangler', 'Cherokee', 'Compass'] },
  { name: 'Dodge', slug: 'dodge', models: ['Charger', 'Challenger', 'Durango', 'Ram 1500'] },
  { name: 'Subaru', slug: 'subaru', models: ['Outback', 'Forester', 'Impreza', 'Legacy', 'Crosstrek'] },
  { name: 'Audi', slug: 'audi', models: ['A4', 'A6', 'Q5', 'Q7', 'Q8'] },
  { name: 'Volkswagen', slug: 'volkswagen', models: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf'] },
  { name: 'Mazda', slug: 'mazda', models: ['CX-5', 'CX-9', 'Mazda3', 'Mazda6', 'CX-30'] },
  { name: 'Nissan', slug: 'nissan', models: ['Altima', 'Rogue', 'Murano', 'Pathfinder', 'Frontier'] },
  { name: 'Mitsubishi', slug: 'mitsubishi', models: ['Outlander', 'Eclipse Cross', 'Galant'] },
  { name: 'Volvo', slug: 'volvo', models: ['XC90', 'XC60', 'S90', 'V90'] },
  { name: 'Ram', slug: 'ram', models: ['1500', '2500', '3500'] },
];

const DAMAGE_TYPES = ['Front', 'Rear', 'Side', 'Hail', 'Flood', 'Fire'];
const STATES = ['NJ', 'TX', 'FL', 'CA', 'IL', 'GA', 'NY', 'PA', 'OH', 'MI'];
const BODY_TYPES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Minivan', 'Wagon'];
const TITLE_STATUSES = ['Salvage', 'Clean', 'Rebuilt', 'Parts Only'];

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

async function seedCalculatorSettings() {
  const settings = [
    { category: 'AUCTION_FEES', key: 'COPART_BUYER_FEES', data: COPART_BUYER_FEES },
    { category: 'AUCTION_FEES', key: 'COPART_PROXY_FEES', data: COPART_PROXY_FEES },
    { category: 'AUCTION_FEES', key: 'COPART_FIXED_FEES', data: COPART_FIXED_FEES },
    { category: 'AUCTION_FEES', key: 'IAAI_BUYER_FEES', data: IAAI_BUYER_FEES },
    { category: 'AUCTION_FEES', key: 'IAAI_PROXY_FEES', data: IAAI_PROXY_FEES },
    { category: 'AUCTION_FEES', key: 'IAAI_FIXED_FEES', data: IAAI_FIXED_FEES },
    { category: 'LOGISTICS', key: 'SEA_LOGISTIC', data: SEA_LOGISTIC },
    { category: 'UKRAINE_DELIVERY', key: 'UKRAINE_DELIVERY', data: UKRAINE_DELIVERY },
    { category: 'COMPANY_FEE', key: 'COMPANY_FEE', data: COMPANY_FEE },
    { category: 'REGISTRATION', key: 'REGISTRATION', data: REGISTRATION },
    { category: 'CUSTOMS', key: 'PENSION_FUND_THRESHOLDS', data: PENSION_FUND_THRESHOLDS },
    { category: 'CUSTOMS', key: 'PETROL_EXCISE', data: PETROL_EXCISE },
    { category: 'CUSTOMS', key: 'DIESEL_EXCISE', data: DIESEL_EXCISE },
    { category: 'CUSTOMS', key: 'EV_EXCISE_RATE', data: EV_EXCISE_RATE },
    { category: 'CUSTOMS', key: 'HYBRID_EXCISE', data: HYBRID_EXCISE },
  ];

  for (const setting of settings) {
    await prisma.calculationSettings.upsert({
      where: {
        category_key_effectiveFrom: {
          category: setting.category,
          key: setting.key,
          effectiveFrom: EFFECTIVE_FROM,
        },
      },
      update: { data: setting.data as object, isActive: true },
      create: {
        category: setting.category,
        key: setting.key,
        data: setting.data as object,
        effectiveFrom: EFFECTIVE_FROM,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${settings.length} CalculationSettings rows`);
}

async function seedMakesAndModels() {
  let makesCount = 0;
  let modelsCount = 0;

  for (const makeData of MAKES_SEED) {
    const make = await prisma.make.upsert({
      where: { slug: makeData.slug },
      update: {},
      create: { name: makeData.name, slug: makeData.slug },
    });
    makesCount++;

    for (const modelName of makeData.models) {
      const modelSlug = slugify(modelName);
      await prisma.model.upsert({
        where: { makeId_slug: { makeId: make.id, slug: modelSlug } },
        update: {},
        create: { makeId: make.id, name: modelName, slug: modelSlug },
      });
      modelsCount++;
    }
  }

  console.log(`Seeded ${makesCount} makes and ${modelsCount} models`);
}

async function seedTestLots() {
  const TOP5_SLUGS = ['toyota', 'honda', 'ford', 'bmw', 'tesla'];

  const makes = await prisma.make.findMany({
    where: { slug: { in: TOP5_SLUGS } },
    include: { models: true },
  });

  if (makes.length === 0) {
    console.log('No makes found for test lots — skipping');
    return;
  }

  const lotsToCreate: Prisma.LotCreateManyInput[] = [];

  for (let i = 0; i < 100; i++) {
    const make = randomItem(makes);
    const model = randomItem(make.models);
    const source: AuctionSource = i % 2 === 0 ? AuctionSource.COPART : AuctionSource.IAAI;
    const lotNumber = `TEST-${String(i + 1).padStart(4, '0')}`;

    lotsToCreate.push({
      source,
      lotNumber,
      makeId: make.id,
      modelId: model.id,
      year: randomInt(2018, 2024),
      finalBid: randomInt(2000, 22000),
      saleStatus: SaleStatus.SOLD,
      saleDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      state: randomItem(STATES),
      damageType: randomItem(DAMAGE_TYPES),
      bodyType: randomItem(BODY_TYPES),
      titleStatus: randomItem(TITLE_STATUSES),
      mileage: randomInt(5000, 150000),
      mileageUnit: MileageUnit.MILES,
      currency: 'USD',
      photoUrls: Array.from({ length: randomInt(1, 4) }, (_, j) =>
        `https://picsum.photos/seed/${lotNumber}-${j}/800/450`
      ),
    });
  }

  // Upsert so re-running seed updates photoUrls on existing lots too
  let count = 0;
  for (const lot of lotsToCreate) {
    await prisma.lot.upsert({
      where: { lotNumber_source: { lotNumber: lot.lotNumber!, source: lot.source! } },
      create: lot,
      update: { photoUrls: lot.photoUrls },
    });
    count++;
  }

  console.log(`Seeded ${count} test lots`);
}

async function main() {
  console.log('Seeding database...');
  await seedCalculatorSettings();
  await seedMakesAndModels();
  await seedTestLots();
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
