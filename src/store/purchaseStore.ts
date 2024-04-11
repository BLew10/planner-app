import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AdvertisementPurchaseModel } from "@/lib/models/advertisementPurchase";

export interface PurchaseSlot {
  id?: string | null;
  slot?: number | null;
  month?: number | null;
  advertisementName?: string | null;
  advertisementId?: string | null;
  companyName?: string | null;
  contactId?: string | null;
  date?: string | null;
}

// export interface AdvertisementPurchase {
//   name?: string;
//   advertisementId?: string;
//   quantity?: number;
//   charge?: number;
//   isDayType?: boolean;
//   perMonth?: number;
//   advertisement?: Advertisement | null;
//   slots?: PurchaseSlot[];
// }

export interface PurchaseOverview {
  contactId?: string;
  companyName?: string;
  year?: string;
  calendarId?: string;
  paymentStartDate?: Date;
  paymentEndDate?: Date;
  amountOwed?: number;
  paymentFrequency?: number;
  purchases?: (Partial<AdvertisementPurchaseModel> | null)[] | null;
}

interface PurchasesStore {
  purchaseOverview?: PurchaseOverview | null;
  setPurchaseData: (data: PurchaseOverview | null) => void;
}

export const usePurchasesStore = create<PurchasesStore>()(
  persist(
    (set, get) => ({
      purchaseOverview: null,
      setPurchaseData: (data: PurchaseOverview | null) => set({ purchaseOverview: data }),
    }),
    {
      name: "purchase-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);


