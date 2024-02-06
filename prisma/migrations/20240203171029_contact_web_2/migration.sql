/*
  Warnings:

  - You are about to drop the `Display` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Display" DROP CONSTRAINT "Display_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Display" DROP CONSTRAINT "Display_monthId_fkey";

-- DropTable
DROP TABLE "Display";

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDayType" BOOLEAN NOT NULL DEFAULT false,
    "contactId" TEXT,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvertisementPurchase" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "contactId" TEXT,

    CONSTRAINT "AdvertisementPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdvertisementPurchase_advertisementId_userId_monthId_year_key" ON "AdvertisementPurchase"("advertisementId", "userId", "monthId", "year");

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_monthId_year_fkey" FOREIGN KEY ("monthId", "year") REFERENCES "Month"("monthId", "year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementPurchase" ADD CONSTRAINT "AdvertisementPurchase_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
