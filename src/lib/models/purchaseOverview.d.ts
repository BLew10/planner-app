import { PurchaseOverview, Contact, AdvertisementPurchase, CalendarEdition, AdvertisementPurchaseSlot, Payment, Prisma} from "@prisma/client";
import { AdvertisementPurchaseModel } from "./advertisementPurchase";
import { AdvertisementPurchaseSlotModel } from "./advertisementPurchaseSlots";
import { ContactModel } from "./contact";

export interface PurchaseOverviewModel extends PurchaseOverview {
    contact: Partial<ContactModel> | null
    calendarEditions: CalendarEdition[]
    payment: Payment | null
    amountOwed: number | Prisma.Decimal
    adPurchases: Partial<AdvertisementPurchaseModel>[] | null
    adPurchaseSlots:  Partial<AdvertisementPurchaseSlotModel>[] | null
}