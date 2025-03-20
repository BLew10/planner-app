import { PaymentOverview, Contact, PurchaseOverview, ScheduledPayment, Payment} from "@prisma/client";
import { PurchaseOverviewModel } from "./purchaseOverview";
import { PaymentModel } from "./payment";
import { ContactModel } from "./contact";

export interface PaymentOverviewModel extends PaymentOverview {
    contact: Partial<ContactModel> | null
    purchase: Partial<PurchaseOverviewModel> | null
    scheduledPayments: ScheduledPayment[]
    payments: Partial<PaymentModel>[]
}