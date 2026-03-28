import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { getPurchaseTableData, PurchaseTableData } from "@/lib/data/purchase";
import deletePurchase from "@/actions/purchases/deletePurchase";
import toggleArtworkSubmitted from "@/actions/purchases/toggleArtworkSubmitted";

export const usePurchases = (
  {
    initialYear = "",
  }: {
    initialYear: string;
  } = { initialYear: "" }
) => {
  const [purchases, setPurchases] = useState<PurchaseTableData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(initialYear);
  const [artworkFilter, setArtworkFilter] = useState("all");

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPurchaseTableData(year, search, artworkFilter);

      const filteredPurchases = result?.purchases || [];

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
  }, [year, search, artworkFilter]);

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

  const [pendingArtworkIds, setPendingArtworkIds] = useState<Set<string>>(
    new Set()
  );

  const handleToggleArtwork = async (
    purchaseId: string,
    value: boolean
  ) => {
    setPurchases((prev) =>
      (prev || []).map((p) =>
        p.id === purchaseId ? { ...p, hasSubmittedArtwork: value } : p
      )
    );

    setPendingArtworkIds((prev) => new Set(prev).add(purchaseId));

    try {
      const success = await toggleArtworkSubmitted(purchaseId, value);
      if (!success) {
        throw new Error("Failed to update artwork status");
      }
    } catch {
      setPurchases((prev) =>
        (prev || []).map((p) =>
          p.id === purchaseId ? { ...p, hasSubmittedArtwork: !value } : p
        )
      );
      toast({
        title: "Error updating artwork status",
        description: "The change could not be saved. The toggle has been reverted.",
        variant: "destructive",
      });
    } finally {
      setPendingArtworkIds((prev) => {
        const next = new Set(prev);
        next.delete(purchaseId);
        return next;
      });
    }
  };

  return {
    purchases,
    isLoading,
    selectedRows,
    setSelectedRows,
    totalItems,
    search,
    setSearch,
    year,
    setYear,
    artworkFilter,
    setArtworkFilter,
    pendingArtworkIds,
    handleDelete,
    handleDeleteSelected,
    handleToggleArtwork,
    fetchPurchases,
  };
};
