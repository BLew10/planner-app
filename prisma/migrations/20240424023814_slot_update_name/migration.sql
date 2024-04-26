/*
  Warnings:

  - You are about to drop the column `advertismentId` on the `AdvertisementPurchaseSlot` table. All the data in the column will be lost.
  - Added the required column `advertisementId` to the `AdvertisementPurchaseSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" DROP CONSTRAINT "AdvertisementPurchaseSlot_advertismentId_fkey";

-- AlterTable
ALTER TABLE "AdvertisementPurchaseSlot" DROP COLUMN "advertismentId",
ADD COLUMN     "advertisementId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchaseSlot" ADD CONSTRAINT "AdvertisementPurchaseSlot_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
