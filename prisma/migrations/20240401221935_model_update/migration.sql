/*
  Warnings:

  - You are about to drop the `PurchaseSlot` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `paymentId` on table `StripeInvoice` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PurchaseSlot" DROP CONSTRAINT "PurchaseSlot_advertisementPurchaseId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseSlot" DROP CONSTRAINT "PurchaseSlot_purchaseId_fkey";

-- AlterTable
ALTER TABLE "StripeInvoice" ALTER COLUMN "paymentId" SET NOT NULL;

-- DropTable
DROP TABLE "PurchaseSlot";

-- CreateTable
CREATE TABLE "AdvertisementPurchaseSlot" (
    "id" TEXT NOT NULL,
    "advertisementPurchaseId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "purchaseId" TEXT,

    CONSTRAINT "AdvertisementPurchaseSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdvertisementPurchaseSlot_advertisementPurchaseId_month_slo_key" ON "AdvertisementPurchaseSlot"("advertisementPurchaseId", "month", "slot");

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_advertisementPurchaseId_fkey" FOREIGN KEY ("advertisementPurchaseId") REFERENCES "AdvertisementPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
