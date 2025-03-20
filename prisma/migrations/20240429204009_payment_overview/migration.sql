/*
  Warnings:

  - You are about to drop the column `paymentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `PurchaseOverview` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `ScheduledPayment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentOverviewId]` on the table `PurchaseOverview` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentOverviewId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentOverviewId` to the `ScheduledPayment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledPayment" DROP CONSTRAINT "ScheduledPayment_paymentId_fkey";

-- DropIndex
DROP INDEX "PurchaseOverview_paymentId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentId",
ADD COLUMN     "contactId" TEXT NOT NULL,
ADD COLUMN     "paymentOverviewId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseOverview" DROP COLUMN "paymentId",
ADD COLUMN     "paymentOverviewId" TEXT;

-- AlterTable
ALTER TABLE "ScheduledPayment" DROP COLUMN "paymentId",
ADD COLUMN     "paymentOverviewId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOverview_paymentOverviewId_key" ON "PurchaseOverview"("paymentOverviewId");

-- AddForeignKey
ALTER TABLE "ScheduledPayment" ADD CONSTRAINT "ScheduledPayment_paymentOverviewId_fkey" FOREIGN KEY ("paymentOverviewId") REFERENCES "PaymentOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentOverviewId_fkey" FOREIGN KEY ("paymentOverviewId") REFERENCES "PaymentOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
