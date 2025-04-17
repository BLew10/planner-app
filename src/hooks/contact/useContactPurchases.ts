import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { getPurchasesByContactId } from "@/lib/data/purchase";
import { Purchase } from "@/lib/data/purchase";

interface GroupedPurchases {
  [key: string]: {
    calendarName: string;
    calendarEditionYear: number;
    purchases: {
      id: string;
      advertisement: {
        name: string;
        id: string;
      };
      calendarName: string;
      calendarEditionYear: number;
      quantity: number;
      charge: number;
      slots: PurchaseSlots[];
    }[];
  };
}

export interface PurchaseSlots {
  id: string;
  slot: number | null;
  month: number;
  date: Date | null;
}

interface UseContactPurchasesOptions {
  contactId: string;
}

export const useContactPurchases = ({
  contactId,
}: UseContactPurchasesOptions) => {
  const [purchases, setPurchases] = useState<Partial<Purchase>[][] | null>(
    null
  );
  const [groupedPurchases, setGroupedPurchases] =
    useState<GroupedPurchases | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const groupPurchasesByCalendarAndYear = (
    purchases: Partial<Purchase>[][] | null
  ) => {
    return (
      purchases?.reduce((acc: { [key: string]: any }, purchaseOverviews) => {
        purchaseOverviews.forEach((purchase) => {
          const { calendarEditionYear } = purchase;
          const key = `${calendarEditionYear}`;

          if (!acc[key]) {
            acc[key] = {
              calendarEditionYear,
              purchases: [],
            };
          }
          acc[key].purchases.push(purchase);
        });

        return acc;
      }, {} as GroupedPurchases) || {}
    );
  };

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const purchasesData = await getPurchasesByContactId(contactId);
      setPurchases(purchasesData);

      // Group the purchases data
      const groupedData = groupPurchasesByCalendarAndYear(purchasesData);
      if (Object.keys(groupedData).length > 0) {
        setGroupedPurchases(groupedData);
      } else {
        setGroupedPurchases(null);
      }
    } catch (error) {
      toast({
        title: "Error fetching purchases",
        description: "There was a problem loading the purchase information.",
        variant: "destructive",
      });
      setPurchases(null);
      setGroupedPurchases(null);
    } finally {
      setIsLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return {
    purchases,
    groupedPurchases,
    isLoading,
    refetch: fetchPurchases,
  };
};
