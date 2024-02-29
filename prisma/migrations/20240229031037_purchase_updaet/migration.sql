/*
  Warnings:

  - Changed the type of `paymentFrequency` on the `PurchaseOverview` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PurchaseOverview" DROP COLUMN "paymentFrequency",
ADD COLUMN     "paymentFrequency" INTEGER NOT NULL;
