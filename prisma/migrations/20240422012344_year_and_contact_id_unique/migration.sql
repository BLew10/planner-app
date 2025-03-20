/*
  Warnings:

  - A unique constraint covering the columns `[year,contactId]` on the table `PurchaseOverview` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOverview_year_contactId_key" ON "PurchaseOverview"("year", "contactId");
