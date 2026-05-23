import { PrismaClient } from '@prisma/client';
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

async function main() {
  console.log('Seeding database...');
  await seedCalculatorSettings();
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
