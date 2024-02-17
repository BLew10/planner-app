import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Purchase {
  name?: string;
  advertisementId?: string;
  quantity?: number;
  charge?: number;
  isDayType?: boolean;
  perMonth?: number;
  months?: {
    monthIndex?: number;
    slots?: number[];
  };
}

export interface PurchaseData {
  contactId?: string;
  companyName?: string;
  purchases?: (Purchase | null)[] | null;
}

interface PurchasesStore {
  purchaseData?: PurchaseData | null;
  setPurchaseData: (data: PurchaseData) => void;
}

export const usePurchasesStore = create<PurchasesStore>()(
  persist(
    (set, get) => ({
      purchaseData: null,
      setPurchaseData: (data: PurchaseData) => set({ purchaseData: data }),
    }),
    {
      name: "purchase-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);


