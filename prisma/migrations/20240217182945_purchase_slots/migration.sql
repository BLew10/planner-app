/*
  Warnings:

  - You are about to drop the column `amount` on the `AdvertisementPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `monthId` on the `AdvertisementPurchase` table. All the data in the column will be lost.
  - You are about to drop the `Month` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `contactId` on table `AdvertisementPurchase` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AdvertisementPurchase" DROP CONSTRAINT "AdvertisementPurchase_contactId_fkey";

-- DropForeignKey
ALTER TABLE "AdvertisementPurchase" DROP CONSTRAINT "AdvertisementPurchase_monthId_year_editionId_fkey";

-- DropForeignKey
ALTER TABLE "Month" DROP CONSTRAINT "Month_editionId_fkey";

-- DropIndex
DROP INDEX "AdvertisementPurchase_advertisementId_userId_monthId_year_key";

-- AlterTable
ALTER TABLE "AdvertisementPurchase" DROP COLUMN "amount",
DROP COLUMN "monthId",
ALTER COLUMN "contactId" SET NOT NULL;

-- DropTable
DROP TABLE "Month";

-- CreateTable
CREATE TABLE "PurchaseSlot" (
    "id" TEXT NOT NULL,
    "advertisementPurchaseId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "PurchaseSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseSlot_advertisementPurchaseId_month_slot_key" ON "PurchaseSlot"("advertisementPurchaseId", "month", "slot");

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseSlot" ADD CONSTRAINT "PurchaseSlot_advertisementPurchaseId_fkey" FOREIGN KEY ("advertisementPurchaseId") REFERENCES "AdvertisementPurchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
