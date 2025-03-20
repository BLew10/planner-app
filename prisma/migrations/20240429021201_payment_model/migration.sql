/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `ScheduledPayment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScheduledPayment" DROP COLUMN "amountPaid";

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "paymentDate" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentType" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PurchaseOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
