/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `ContactTelecomInformation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PaymentInvoice" ADD COLUMN     "stripeUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ContactTelecomInformation_email_key" ON "ContactTelecomInformation"("email");
