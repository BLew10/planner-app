import { PaymentOverview, Contact, PurchaseOverview, ScheduledPayment} from "@prisma/client";

export interface PaymentOverviewModel extends PaymentOverview {
    contact: Contact
    purchases: PurchaseOverview
    scheduledPayments: ScheduledPayment[]
}