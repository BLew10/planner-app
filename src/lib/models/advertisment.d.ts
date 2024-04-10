
import { Advertisement, AdvertisementPurchase } from "@prisma/client"
export interface AdvertisementModel extends Advertisement {
    purchases: AdvertisementPurchase[]
}
