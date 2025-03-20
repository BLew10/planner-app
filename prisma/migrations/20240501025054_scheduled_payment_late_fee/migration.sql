-- AlterTable
ALTER TABLE "ScheduledPayment" ADD COLUMN     "amountPaid" DECIMAL(65,30),
ADD COLUMN     "lateFeeWaived" BOOLEAN NOT NULL DEFAULT false;
