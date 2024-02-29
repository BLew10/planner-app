/*
  Warnings:

  - You are about to drop the column `paymentAmount` on the `PurchaseOverview` table. All the data in the column will be lost.
  - Added the required column `amountOwed` to the `PurchaseOverview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOverview" DROP COLUMN "paymentAmount",
ADD COLUMN     "amountOwed" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "paymentStartDate" DROP NOT NULL,
ALTER COLUMN "paymentEndDate" DROP NOT NULL;
