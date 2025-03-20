/*
  Warnings:

  - Added the required column `contactId` to the `AdvertisementPurchaseSlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdvertisementPurchaseSlot" ADD COLUMN     "contactId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
