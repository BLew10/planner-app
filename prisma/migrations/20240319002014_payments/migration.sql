-- AlterTable
ALTER TABLE "PurchaseOverview" ADD COLUMN     "paymentId" TEXT;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "totalOwed" DECIMAL(65,30) NOT NULL,
    "totalPaid" DECIMAL(65,30) NOT NULL,
    "frequency" TEXT NOT NULL,
    "totalPayments" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "anticipatedEndDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "paymentsMade" INTEGER NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PurchaseOverview" ADD CONSTRAINT "PurchaseOverview_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
