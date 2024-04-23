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


export interface PurchaseOverviewState {
  [calendarId: string]: {
    [adId: string]: {
      quantity: string;
      charge: string;
      slots?: { slot: number; month: number; date: string | null }[];
    };
  };
}

interface PurchasesStore {
  purchaseOverview: PurchaseOverviewState | null;
  setPurchaseData: (
    data: { [adId: string]: { quantity: string, charge: string, slots?: { slot: number, month: number; date: string | null }[] } },
    calendarId: string
  ) => void;
  addCalendarId: (calendarId: string) => void;
  removeCalendarId: (calendarId: string) => void;
  setCharge: (calendarId: string, adId: string, charge: string) => void;
  setQuantity: (calendarId: string, adId: string, quantity: string) => void;
  reset: () => void;
  getByCalendarIdAdId: (calendarId: string, adId: string) => { quantity: string, charge: string, slots?: { slot: number, month: number; date: string | null }[]};
}


export const usePurchasesStore = create<PurchasesStore>()(
  persist(
    (set, get) => ({
      purchaseOverview: null,
      setPurchaseData: (data, calendarId) => {
        const { purchaseOverview } = get();
        set({
          purchaseOverview: {
            ...purchaseOverview,
            [calendarId]: {
              ...purchaseOverview?.[calendarId],
              ...data,
            },
          },
        });
      },
      addCalendarId: (calendarId: string) => {
        const { purchaseOverview } = get();
        if (!purchaseOverview) {
          set({ purchaseOverview: { [calendarId]: {} } });
          return;
        }

        if (!purchaseOverview[calendarId]) {
          set({
            purchaseOverview: {
              ...purchaseOverview,
              [calendarId]: {},
            },
          });
        }
      },
      removeCalendarId: (calendarId: string) => {
        const { purchaseOverview } = get();
        if (!purchaseOverview) return;

        const updatedOverview = { ...purchaseOverview };
        delete updatedOverview[calendarId];
        set({ purchaseOverview: updatedOverview });
      },
      reset: () => set({ purchaseOverview: null }),
      getByCalendarIdAdId: (calendarId, adId) => {
        const { purchaseOverview } = get();
        if (!purchaseOverview || !purchaseOverview[calendarId] || !purchaseOverview[calendarId][adId]) {
          return { quantity: "", charge: "", slots: [] };
        } else {
          return purchaseOverview[calendarId][adId];
        }
      },
      setCharge: (calendarId: string, adId: string, charge: string) => {
        set((state) => {
          const currentCalendar = state.purchaseOverview?.[calendarId] || {};
          const currentAd = currentCalendar[adId] || { quantity: '', charge: '', slots: [] };
          return {
            purchaseOverview: {
              ...state.purchaseOverview,
              [calendarId]: {
                ...currentCalendar,
                [adId]: {
                  ...currentAd,
                  charge: charge,
                },
              },
            },
          };
        });
      },
      setQuantity: (calendarId: string, adId: string, quantity: string) => {
        set((state) => {
          const currentCalendar = state.purchaseOverview?.[calendarId] || {};
          const currentAd = currentCalendar[adId] || { quantity: '', charge: '', slots: [] };
          return {
            purchaseOverview: {
              ...state.purchaseOverview,
              [calendarId]: {
                ...currentCalendar,
                [adId]: {
                  ...currentAd,
                  quantity: quantity,
                },
              },
            },
          };
        });
      },
    }),
    {
      name: "purchase-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
