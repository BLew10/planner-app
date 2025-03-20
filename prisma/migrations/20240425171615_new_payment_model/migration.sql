/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentInvoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentInvoice" DROP CONSTRAINT "PaymentInvoice_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOverview" DROP CONSTRAINT "PurchaseOverview_paymentId_fkey";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "PaymentInvoice";

-- CreateTable
CREATE TABLE "PaymentOverview" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "contactId" TEXT,
    "totalSale" DECIMAL(65,30) NOT NULL,
    "additionalDiscount1" DECIMAL(65,30),
    "additionalDiscount2" DECIMAL(65,30),
    "additionalSales1" DECIMAL(65,30),
    "additionalSales2" DECIMAL(65,30),
    "trade" DECIMAL(65,30),
    "earlyPaymentDiscount" DECIMAL(65,30),
    "earlyPaymentDiscountPercent" DECIMAL(65,30),
    "amountPrepaid" DECIMAL(65,30),
    "paymentMethod" TEXT,
    "checkNumber" TEXT,
    "paymentDueOn" INTEGER,
    "paymentOnLastDay" BOOLEAN NOT NULL,
    "lateFee" DECIMAL(65,30),
    "lateFeePercent" DECIMAL(65,30),
    "deliveryMethod" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "cardNumber" TEXT,
    "cardExpirationDate" TIMESTAMP(3),
    "invoiceMessage" TEXT,
    "statementMessage" TEXT,

    CONSTRAINT "PaymentOverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledPayment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentDate" TEXT,

    CONSTRAINT "ScheduledPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PurchaseOverview" ADD CONSTRAINT "PurchaseOverview_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentOverview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOverview" ADD CONSTRAINT "PaymentOverview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOverview" ADD CONSTRAINT "PaymentOverview_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPayment" ADD CONSTRAINT "ScheduledPayment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
