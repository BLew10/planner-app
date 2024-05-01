/*
  Warnings:

  - You are about to drop the column `paymentType` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `amountPrepaid` on the `PaymentOverview` table. All the data in the column will be lost.
  - You are about to drop the column `checkNumber` on the `PaymentOverview` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `PaymentOverview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentType",
ADD COLUMN     "checkNumber" TEXT,
ADD COLUMN     "paymentMethod" TEXT;

-- AlterTable
ALTER TABLE "PaymentOverview" DROP COLUMN "amountPrepaid",
DROP COLUMN "checkNumber",
DROP COLUMN "paymentMethod",
ADD COLUMN     "prepaid" BOOLEAN NOT NULL DEFAULT false;
