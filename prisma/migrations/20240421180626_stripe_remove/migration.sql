/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `stripeScheduleId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceLink` on the `PaymentInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `stripeInvoiceId` on the `PaymentInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `stripeScheduleId` on the `PaymentInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `stripeUrl` on the `PaymentInvoice` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Contact_stripeCustomerId_key";

-- DropIndex
DROP INDEX "Payment_stripeScheduleId_key";

-- DropIndex
DROP INDEX "Payment_stripeSubscriptionId_key";

-- DropIndex
DROP INDEX "PaymentInvoice_stripeInvoiceId_key";

-- DropIndex
DROP INDEX "PaymentInvoice_stripeScheduleId_key";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "stripeCustomerId";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripeScheduleId",
DROP COLUMN "stripeSubscriptionId";

-- AlterTable
ALTER TABLE "PaymentInvoice" DROP COLUMN "invoiceLink",
DROP COLUMN "stripeInvoiceId",
DROP COLUMN "stripeScheduleId",
DROP COLUMN "stripeUrl";
