/*
  Warnings:

  - You are about to drop the column `lateFee` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `paymentOverviewId` to the `PaymentAllocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "lateFee";

-- AlterTable
ALTER TABLE "PaymentAllocation" ADD COLUMN     "paymentOverviewId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentOverviewId_fkey" FOREIGN KEY ("paymentOverviewId") REFERENCES "PaymentOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
