import { PurchaseOverview, Contact, AdvertisementPurchase, CalendarEdition, AdvertisementPurchaseSlot, Payment, Prisma} from "@prisma/client";
import { AdvertisementPurchaseModel } from "./advertisementPurchase";
import { AdvertisementPurchaseSlotModel } from "./advertisementPurchaseSlots";

export interface PurchaseOverviewModel extends PurchaseOverview {
    contact: Contact
    calendarEdition: CalendarEdition
    payment: Payment | null
    amountOwed: number | Prisma.Decimal
    adPurchases: Partial<AdvertisementPurchaseModel>[] | null
    adPurchaseSlots:  Partial<AdvertisementPurchaseSlotModel>[] | null
}