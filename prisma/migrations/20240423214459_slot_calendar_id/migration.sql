/*
  Warnings:

  - Added the required column `calendarId` to the `AdvertisementPurchaseSlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdvertisementPurchaseSlot" ADD COLUMN     "calendarId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "CalendarEdition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
