import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { getPurchaseTableData, PurchaseTableData } from "@/lib/data/purchase";
import deletePurchase from "@/actions/purchases/deletePurchase";

export const usePurchases = (
  {
    itemsPerPage = 10,
    initialYear = "",
  }: {
    itemsPerPage?: number;
    initialYear: string;
  } = { initialYear: "" }
) => {
  const [purchases, setPurchases] = useState<PurchaseTableData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(initialYear);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      // The existing function doesn't support pagination and search directly,
      // so we might need to adapt it or filter client-side temporarily
      const result = await getPurchaseTableData(
        year,
        page,
        itemsPerPage,
        search
      );

      // Filter by search if provided
      let filteredPurchases = result?.purchases || [];
      if (search && filteredPurchases) {
        const searchLower = search.toLowerCase();
        filteredPurchases = filteredPurchases.filter(
          (purchase) =>
            purchase.companyName.toLowerCase().includes(searchLower) ||
            purchase.calendarEditions.toLowerCase().includes(searchLower)
        );
      }

      setPurchases(filteredPurchases);
      setTotalItems(result?.total || 0);
      setSelectedRows([]);
    } catch (error) {
      toast({
        title: "Error fetching purchases",
        description: "There was a problem loading the purchases.",
        variant: "destructive",
      });
      setPurchases(null);
    } finally {
      setIsLoading(false);
    }
  }, [year, search]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleDelete = async (id: string, paymentOverviewId: string) => {
    try {
      const success = await deletePurchase(id, paymentOverviewId);
      if (success) {
        toast({
          title: "Purchase deleted",
          description: "The purchase was successfully deleted.",
        });
        // Refresh the purchases
        fetchPurchases();
        return true;
      } else {
        throw new Error("Failed to delete purchase");
      }
    } catch (error) {
      toast({
        title: "Error deleting purchase",
        description: "There was a problem deleting the purchase.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    try {
      // Implement multi-delete functionality
      // This might need to be added to your backend if it doesn't exist
      let success = true;
      for (const id of selectedRows) {
        const purchase = purchases?.find((p) => p.id === id);
        if (purchase) {
          const result = await deletePurchase(
            id,
            purchase.paymentOverviewId || ""
          );
          if (!result) success = false;
        }
      }

      if (success) {
        toast({
          title: "Purchases deleted",
          description: `${selectedRows.length} purchases were successfully deleted.`,
        });
        // Refresh the purchases
        fetchPurchases();
        return true;
      } else {
        throw new Error("Some purchases could not be deleted");
      }
    } catch (error) {
      toast({
        title: "Error deleting purchases",
        description:
          "There was a problem deleting some or all of the selected purchases.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    purchases,
    isLoading,
    selectedRows,
    setSelectedRows,
    totalItems,
    page,
    setPage,
    search,
    setSearch,
    year,
    setYear,
    handleDelete,
    handleDeleteSelected,
    fetchPurchases,
  };
};
