-- AlterTable
ALTER TABLE "PaymentInvoice" ALTER COLUMN "datePaid" DROP NOT NULL,
ALTER COLUMN "dateSent" DROP NOT NULL,
ALTER COLUMN "dateDue" DROP NOT NULL;
