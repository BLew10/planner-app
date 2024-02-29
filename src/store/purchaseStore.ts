import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PurchaseSlot {
  date: Date;
  slot: number;
}

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
  year?: string;
  calendarId?: string;
  paymentStartDate?: Date;
  paymentEndDate?: Date;
  amountOwed?: number;
  paymentFrequency?: number;
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


