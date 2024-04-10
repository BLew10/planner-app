/*
  Warnings:

  - You are about to drop the `StripeInvoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StripeInvoice" DROP CONSTRAINT "StripeInvoice_paymentId_fkey";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "stripeScheduleId" TEXT;

-- DropTable
DROP TABLE "StripeInvoice";
