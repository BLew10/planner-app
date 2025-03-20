/*
  Warnings:

  - A unique constraint covering the columns `[year,calendarId,month,slot]` on the table `AdvertisementPurchaseSlot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `advertismentId` to the `AdvertisementPurchaseSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `AdvertisementPurchaseSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AdvertisementPurchaseSlot_advertisementPurchaseId_month_slo_key";

-- AlterTable
ALTER TABLE "AdvertisementPurchaseSlot" ADD COLUMN     "advertismentId" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AdvertisementPurchaseSlot_year_calendarId_month_slot_key" ON "AdvertisementPurchaseSlot"("year", "calendarId", "month", "slot");

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_advertismentId_fkey" FOREIGN KEY ("advertismentId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
