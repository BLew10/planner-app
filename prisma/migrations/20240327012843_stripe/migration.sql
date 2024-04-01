-- CreateTable
CREATE TABLE "StripeInvoice" (
    "id" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,

    CONSTRAINT "StripeInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeInvoice_stripeInvoiceId_key" ON "StripeInvoice"("stripeInvoiceId");

-- AddForeignKey
ALTER TABLE "StripeInvoice" ADD CONSTRAINT "StripeInvoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
