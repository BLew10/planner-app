/*
  Warnings:

  - You are about to drop the column `year` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentEndDate` on the `PurchaseOverview` table. All the data in the column will be lost.
  - You are about to drop the column `paymentFrequency` on the `PurchaseOverview` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStartDate` on the `PurchaseOverview` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `PurchaseOverview` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `PurchaseOverview` table. All the data in the column will be lost.
  - You are about to drop the column `paymentsMade` on the `PurchaseOverview` table. All the data in the column will be lost.
  - Added the required column `contactId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "year",
ADD COLUMN     "contactId" TEXT NOT NULL,
ALTER COLUMN "paymentsMade" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseOverview" DROP COLUMN "paymentEndDate",
DROP COLUMN "paymentFrequency",
DROP COLUMN "paymentStartDate",
DROP COLUMN "paymentStatus",
DROP COLUMN "paymentType",
DROP COLUMN "paymentsMade";

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
