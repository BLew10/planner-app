
import { AdvertisementPurchase, Prisma } from "@prisma/client"
import { PurchaseOverviewModel } from "./purchaseOverview";
import { AdvertisementPurchaseSlotModel } from "./advertisementPurchaseSlots";
import { AdvertisementModel } from "./advertisment";
export interface AdvertisementPurchaseModel extends AdvertisementPurchase {
    advertisement: Partial<AdvertisementModel>,
    charge: number | Prisma.Decimal,
    purchaseOverview: Partial<PurchaseOverviewModel> | null,
    adPurchaseSlots: Partial<AdvertisementPurchaseSlotModel>[] | null
}