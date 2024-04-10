import { PurchaseOverview, Contact, AdvertisementPurchase, CalendarEdition, AdvertisementPurchaseSlot, Payment} from "@prisma/client";

export interface PurchaseOverviewModel extends PurchaseOverview {
    contact: Contact
    calendarEdition: CalendarEdition
    payment: Payment | null
    adPurchases: AdvertisementPurchase[] | null
    adPurchaseSlots: AdvertisementPurchaseSlot[] | null
}