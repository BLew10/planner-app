/*
  Warnings:

  - Added the required column `year` to the `PaymentOverview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentOverview" ADD COLUMN     "year" INTEGER NOT NULL;