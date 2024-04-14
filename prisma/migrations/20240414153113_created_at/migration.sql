/*
  Warnings:

  - Made the column `createdAt` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
