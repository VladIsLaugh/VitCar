-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('SOLD', 'UNSOLD');

-- CreateEnum
CREATE TYPE "MileageUnit" AS ENUM ('MILES', 'KM');

-- CreateTable
CREATE TABLE "Make" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Make_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "makeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" TEXT NOT NULL,
    "source" "AuctionSource" NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "vin" TEXT,
    "makeId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "bodyType" TEXT,
    "fuelType" "FuelType",
    "engineCC" INTEGER,
    "mileage" INTEGER,
    "mileageUnit" "MileageUnit" NOT NULL DEFAULT 'MILES',
    "damageType" TEXT,
    "titleStatus" TEXT,
    "saleStatus" "SaleStatus" NOT NULL DEFAULT 'SOLD',
    "finalBid" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "saleDate" TIMESTAMP(3),
    "location" TEXT,
    "state" TEXT,
    "photoUrls" TEXT[],
    "externalUrl" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Make_name_key" ON "Make"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Make_slug_key" ON "Make"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Model_makeId_slug_key" ON "Model"("makeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_lotNumber_source_key" ON "Lot"("lotNumber", "source");

-- CreateIndex
CREATE INDEX "Lot_makeId_modelId_year_idx" ON "Lot"("makeId", "modelId", "year");

-- CreateIndex
CREATE INDEX "Lot_saleDate_idx" ON "Lot"("saleDate");

-- CreateIndex
CREATE INDEX "Lot_finalBid_idx" ON "Lot"("finalBid");

-- CreateIndex
CREATE INDEX "Lot_state_idx" ON "Lot"("state");

-- CreateIndex
CREATE INDEX "Lot_saleStatus_idx" ON "Lot"("saleStatus");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- GIN index for full-text search on VIN and lot number
CREATE INDEX IF NOT EXISTS idx_lots_text
  ON "Lot" USING GIN(to_tsvector('english',
    coalesce(vin, '') || ' ' || coalesce("lotNumber", '')));
