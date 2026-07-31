-- CreateEnum: AuctionCondition
DO $$ BEGIN
  CREATE TYPE "AuctionCondition" AS ENUM ('RUN_AND_DRIVE', 'ENGINE_START', 'STATIONARY', 'ENHANCED_VEHICLE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: FuelType
DO $$ BEGIN
  CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: AuctionSource
DO $$ BEGIN
  CREATE TYPE "AuctionSource" AS ENUM ('COPART', 'IAAI');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateTable: Calculation
CREATE TABLE IF NOT EXISTS "Calculation" (
    "id"               TEXT NOT NULL,
    "userId"           TEXT,
    "shareToken"       TEXT NOT NULL,
    "inputParams"      JSONB NOT NULL,
    "result"           JSONB NOT NULL,
    "settingsSnapshot" JSONB NOT NULL,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt"        TIMESTAMP(3),

    CONSTRAINT "Calculation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Calculation_shareToken_key" ON "Calculation"("shareToken");
CREATE INDEX IF NOT EXISTS "Calculation_userId_idx" ON "Calculation"("userId");

ALTER TABLE "Calculation"
  DROP CONSTRAINT IF EXISTS "Calculation_userId_fkey";
ALTER TABLE "Calculation"
  ADD CONSTRAINT "Calculation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: CalculationSettings
CREATE TABLE IF NOT EXISTS "CalculationSettings" (
    "id"            TEXT NOT NULL,
    "category"      TEXT NOT NULL,
    "key"           TEXT NOT NULL,
    "data"          JSONB NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo"   TIMESTAMP(3),
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculationSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CalculationSettings_category_key_effectiveFrom_key"
  ON "CalculationSettings"("category", "key", "effectiveFrom");
