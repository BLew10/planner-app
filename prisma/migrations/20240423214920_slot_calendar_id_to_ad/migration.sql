/*
  Warnings:

  - Added the required column `calendarId` to the `AdvertisementPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdvertisementPurchase" ADD COLUMN     "calendarId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "CalendarEdition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
