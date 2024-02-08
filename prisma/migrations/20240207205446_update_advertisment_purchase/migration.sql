/*
  Warnings:

  - You are about to drop the column `contactId` on the `Advertisement` table. All the data in the column will be lost.
  - Added the required column `amount` to the `AdvertisementPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cost` to the `AdvertisementPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_contactId_fkey";

-- AlterTable
ALTER TABLE "Advertisement" DROP COLUMN "contactId",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "perMonth" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "AdvertisementPurchase" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "cost" DECIMAL(65,30) NOT NULL;
