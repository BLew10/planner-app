/*
  Warnings:

  - Made the column `amountPaid` on table `ScheduledPayment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ScheduledPayment" ALTER COLUMN "amountPaid" SET NOT NULL,
ALTER COLUMN "amountPaid" SET DEFAULT 0;
