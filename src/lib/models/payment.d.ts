import { Payment, StripeInvoice, Contact, PurchaseOverview} from "@prisma/client";

export interface PaymentModel extends Payment {
    contact: Contact
    purchases: PurchaseOverview
    stripeInvoice: StripeInvoice
}