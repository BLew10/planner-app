import { AdvertisementPurchaseSlot } from "@prisma/client"
import { ContactModel } from "./contact"
import { PurchaseOverviewModel } from "./purchaseOverview"
import { AdvertisementPurchaseModel } from "./advertisementPurchase"
import { CalendarEditionModel } from "./calendarEdition"
import { AdvertisementModel } from "./advertisment"

export interface AdvertisementPurchaseSlotModel extends AdvertisementPurchaseSlot {
    advertisementPurchase: Partial<AdvertisementPurchaseModel> | null
    purchaseOverview: Partial<PurchaseOverviewModel> | null
    contact: Partial<ContactModel> | null
    calendar: Partial<CalendarEditionModel> | null
    advertisement: Partial<AdvertisementModel> | null
}
