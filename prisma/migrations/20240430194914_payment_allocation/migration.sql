/*
  Warnings:

  - A unique constraint covering the columns `[invoiceNumber]` on the table `PaymentOverview` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceNumber` to the `PaymentOverview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentOverview" ADD COLUMN     "invoiceNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ScheduledPayment" ADD COLUMN     "isLate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "scheduledPaymentId" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_scheduledPaymentId_key" ON "PaymentAllocation"("paymentId", "scheduledPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOverview_invoiceNumber_key" ON "PaymentOverview"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_scheduledPaymentId_fkey" FOREIGN KEY ("scheduledPaymentId") REFERENCES "ScheduledPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
