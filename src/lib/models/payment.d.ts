import { PaymentOverview, Contact, PurchaseOverview, ScheduledPayment, Payment} from "@prisma/client";
import { PurchaseOverviewModel } from "./purchaseOverview";
import { PaymentOverviewModel } from "./paymentOverview";
import { ContactModel } from "./contact";
import { Prisma } from "@prisma/client";

export interface PaymentModel extends Payment {
    contact: Partial<ContactModel> | null
    purchase: Partial<PurchaseOverviewModel> | null
    paymentOverview: Partial<PaymentOverviewModel> | null
    amount: number | Prisma.Decimal | null
}