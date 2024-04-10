
import { AdvertisementPurchaseSlot, AdvertisementPurchase, PurchaseOverview} from "@prisma/client"
export interface AdvertisementPurchaseSlotModel extends AdvertisementPurchaseSlot {
    advertisementPurchase: AdvertisementPurchase | null
    purchaseOverview: PurchaseOverview | null
}
