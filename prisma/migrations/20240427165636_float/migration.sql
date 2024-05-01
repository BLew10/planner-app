/*
  Warnings:

  - You are about to alter the column `charge` on the `AdvertisementPurchase` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `totalSale` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `additionalDiscount1` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `additionalDiscount2` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `additionalSales1` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `additionalSales2` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `trade` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `earlyPaymentDiscount` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `earlyPaymentDiscountPercent` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `amountPrepaid` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lateFee` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lateFeePercent` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `amountPaid` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `net` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `amountOwed` on the `PurchaseOverview` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `amount` on the `ScheduledPayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "AdvertisementPurchase" ALTER COLUMN "charge" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PaymentOverview" ALTER COLUMN "totalSale" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "additionalDiscount1" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "additionalDiscount2" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "additionalSales1" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "additionalSales2" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "trade" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "earlyPaymentDiscount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "earlyPaymentDiscountPercent" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "amountPrepaid" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lateFee" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lateFeePercent" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "amountPaid" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "net" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PurchaseOverview" ALTER COLUMN "amountOwed" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ScheduledPayment" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;
