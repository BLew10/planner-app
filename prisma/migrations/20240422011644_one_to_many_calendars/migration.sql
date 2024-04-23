/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `CalendarEdition` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOverview" DROP CONSTRAINT "PurchaseOverview_editionId_fkey";

-- AlterTable
ALTER TABLE "CalendarEdition" ADD COLUMN     "code" TEXT;

-- CreateTable
CREATE TABLE "_CalendarEditionToPurchaseOverview" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CalendarEditionToPurchaseOverview_AB_unique" ON "_CalendarEditionToPurchaseOverview"("A", "B");

-- CreateIndex
CREATE INDEX "_CalendarEditionToPurchaseOverview_B_index" ON "_CalendarEditionToPurchaseOverview"("B");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEdition_code_key" ON "CalendarEdition"("code");

-- AddForeignKey
ALTER TABLE "_CalendarEditionToPurchaseOverview" ADD CONSTRAINT "_CalendarEditionToPurchaseOverview_A_fkey" FOREIGN KEY ("A") REFERENCES "CalendarEdition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalendarEditionToPurchaseOverview" ADD CONSTRAINT "_CalendarEditionToPurchaseOverview_B_fkey" FOREIGN KEY ("B") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
