
import { Advertisement, AdvertisementPurchase, PurchaseOverview, AdvertisementPurchaseSlot } from "@prisma/client"
export interface AdvertisementPurchaseModel extends AdvertisementPurchase {
    advertisement: Advertisement,
    purchaseOverview: PurchaseOverview | null,
    adPurchaseSlots: AdvertisementPurchaseSlot[] | null
}
