/*
  Warnings:

  - A unique constraint covering the columns `[monthId,year,editionId]` on the table `Month` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `editionId` to the `AdvertisementPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AdvertisementPurchase" DROP CONSTRAINT "AdvertisementPurchase_monthId_year_fkey";

-- DropIndex
DROP INDEX "Month_monthId_year_key";

-- AlterTable
ALTER TABLE "AdvertisementPurchase" ADD COLUMN     "editionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Month_monthId_year_editionId_key" ON "Month"("monthId", "year", "editionId");

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_monthId_year_editionId_fkey" FOREIGN KEY ("monthId", "year", "editionId") REFERENCES "Month"("monthId", "year", "editionId") ON DELETE RESTRICT ON UPDATE CASCADE;
