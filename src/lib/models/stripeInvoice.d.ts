import { StripeInvoice, Payment } from "@prisma/client";

export interface StripeInvoiceModel extends StripeInvoice {
    payment: Payment
}