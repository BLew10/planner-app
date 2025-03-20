/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `ScheduledPayment` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `ScheduledPayment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDate` on the `ScheduledPayment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScheduledPayment" DROP COLUMN "amountPaid",
DROP COLUMN "isPaid",
DROP COLUMN "paymentDate";
