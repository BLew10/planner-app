/*
  Warnings:

  - A unique constraint covering the columns `[purchaseId]` on the table `PaymentOverview` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentId]` on the table `PurchaseOverview` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOverview" DROP CONSTRAINT "PurchaseOverview_paymentId_fkey";

-- AlterTable
ALTER TABLE "PaymentOverview" ADD COLUMN     "purchaseId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOverview_purchaseId_key" ON "PaymentOverview"("purchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOverview_paymentId_key" ON "PurchaseOverview"("paymentId");

-- AddForeignKey
ALTER TABLE "PaymentOverview" ADD CONSTRAINT "PaymentOverview_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
