/*
  Warnings:

  - You are about to drop the column `cost` on the `AdvertisementPurchase` table. All the data in the column will be lost.
  - Added the required column `charge` to the `AdvertisementPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `AdvertisementPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdvertisementPurchase" DROP COLUMN "cost",
ADD COLUMN     "charge" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL;
