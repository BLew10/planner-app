/*
  Warnings:

  - A unique constraint covering the columns `[lastPaymentId]` on the table `PaymentOverview` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PaymentOverview_lastPaymentId_key" ON "PaymentOverview"("lastPaymentId");
