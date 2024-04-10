/*
  Warnings:

  - A unique constraint covering the columns `[stripeInvoiceId]` on the table `PaymentInvoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeScheduleId]` on the table `PaymentInvoice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PaymentInvoice_stripeInvoiceId_key" ON "PaymentInvoice"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInvoice_stripeScheduleId_key" ON "PaymentInvoice"("stripeScheduleId");
