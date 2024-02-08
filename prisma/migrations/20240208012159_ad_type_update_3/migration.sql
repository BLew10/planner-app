/*
  Warnings:

  - The primary key for the `CalendarEdition` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "AdvertisementPurchase" DROP CONSTRAINT "AdvertisementPurchase_monthId_year_editionId_fkey";

-- DropForeignKey
ALTER TABLE "Month" DROP CONSTRAINT "Month_editionId_fkey";

-- AlterTable
ALTER TABLE "AdvertisementPurchase" ALTER COLUMN "editionId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "CalendarEdition" DROP CONSTRAINT "CalendarEdition_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CalendarEdition_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CalendarEdition_id_seq";

-- AlterTable
ALTER TABLE "Month" ALTER COLUMN "editionId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Month" ADD CONSTRAINT "Month_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "CalendarEdition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_monthId_year_editionId_fkey" FOREIGN KEY ("monthId", "year", "editionId") REFERENCES "Month"("monthId", "year", "editionId") ON DELETE RESTRICT ON UPDATE CASCADE;
