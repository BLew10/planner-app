/*
  Warnings:

  - Added the required column `net` to the `PaymentOverview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentOverview" ADD COLUMN     "net" DECIMAL(65,30) NOT NULL;
