/*
  Warnings:

  - You are about to alter the column `charge` on the `AdvertisementPurchase` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalSale` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `additionalDiscount1` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `additionalDiscount2` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `additionalSales1` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `additionalSales2` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `trade` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `earlyPaymentDiscount` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `earlyPaymentDiscountPercent` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amountPrepaid` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `lateFee` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `lateFeePercent` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amountPaid` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `net` on the `PaymentOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amountOwed` on the `PurchaseOverview` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `ScheduledPayment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "AdvertisementPurchase" ALTER COLUMN "charge" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "PaymentOverview" ALTER COLUMN "totalSale" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "additionalDiscount1" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "additionalDiscount2" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "additionalSales1" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "additionalSales2" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "trade" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "earlyPaymentDiscount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "earlyPaymentDiscountPercent" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "amountPrepaid" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "lateFee" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "lateFeePercent" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "net" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "PurchaseOverview" ALTER COLUMN "amountOwed" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ScheduledPayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);
