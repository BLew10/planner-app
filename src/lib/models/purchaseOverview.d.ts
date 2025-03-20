import { PurchaseOverview, Contact, AdvertisementPurchase, CalendarEdition, AdvertisementPurchaseSlot, PaymentOverview , Prisma} from "@prisma/client";
import { AdvertisementPurchaseModel } from "./advertisementPurchase";
import { AdvertisementPurchaseSlotModel } from "./advertisementPurchaseSlots";
import { PaymentOverviewModel } from "./paymentOverview";
import { ContactModel } from "./contact";

export interface PurchaseOverviewModel extends PurchaseOverview {
    contact: Partial<ContactModel> | null
    calendarEditions: CalendarEdition[]
    paymentOverview: Partial<PaymentOverviewModel> | null
    amountOwed: number | Prisma.Decimal
    adPurchases: Partial<AdvertisementPurchaseModel>[] | null
    adPurchaseSlots:  Partial<AdvertisementPurchaseSlotModel>[] | null
}