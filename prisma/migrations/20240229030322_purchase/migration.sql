/*
  Warnings:

  - You are about to drop the column `contactId` on the `AdvertisementPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `editionId` on the `AdvertisementPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AdvertisementPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `AdvertisementPurchase` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdvertisementPurchase" DROP CONSTRAINT "AdvertisementPurchase_contactId_fkey";

-- DropForeignKey
ALTER TABLE "AdvertisementPurchase" DROP CONSTRAINT "AdvertisementPurchase_userId_fkey";

-- AlterTable
ALTER TABLE "AdvertisementPurchase" DROP COLUMN "contactId",
DROP COLUMN "editionId",
DROP COLUMN "userId",
DROP COLUMN "year",
ADD COLUMN     "purchaseId" TEXT;

-- CreateTable
CREATE TABLE "PurchaseOverview" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "paymentStartDate" TIMESTAMP(3) NOT NULL,
    "paymentEndDate" TIMESTAMP(3) NOT NULL,
    "paymentAmount" DECIMAL(65,30) NOT NULL,
    "paymentFrequency" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "paymentsMade" INTEGER NOT NULL,

    CONSTRAINT "PurchaseOverview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PurchaseOverview" ADD CONSTRAINT "PurchaseOverview_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOverview" ADD CONSTRAINT "PurchaseOverview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
