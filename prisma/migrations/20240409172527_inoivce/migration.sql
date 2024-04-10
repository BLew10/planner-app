-- CreateTable
CREATE TABLE "PaymentInvoice" (
    "id" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "stripeScheduleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amountOwed" DECIMAL(65,30) NOT NULL,
    "datePaid" TIMESTAMP(3) NOT NULL,
    "dateSent" TIMESTAMP(3) NOT NULL,
    "dateDue" TIMESTAMP(3) NOT NULL,
    "invoiceLink" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PaymentInvoice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentInvoice" ADD CONSTRAINT "PaymentInvoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
