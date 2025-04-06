import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { PaymentModel } from "@/lib/models/payment";
import deletePayment from "@/actions/payment/deletePayment";

// This function will need to be updated in your data layer
import { getPaymentsByCalendarEditionYear } from "@/lib/data/payment";

export const usePayments = (
  {
    itemsPerPage = 10,
    initialYear = "",
  }: {
    itemsPerPage?: number;
    initialYear: string;
  } = { initialYear: "" }
) => {
  const [payments, setPayments] = useState<Partial<PaymentModel>[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(initialYear);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      // In an ideal world, we'd update the API to support pagination, search, etc.
      // For now, we'll handle it client-side
      const result = await getPaymentsByCalendarEditionYear(
        year,
        page,
        itemsPerPage,
        search
      );

      if (Array.isArray(result)) {
        // Legacy API returns just an array - we'll need to handle pagination manually
        setPayments(result);
        setTotalItems(result.length);
      } else {
        // If API is updated to return { payments, total }
        setPayments(result?.payments || []);
        setTotalItems(result?.total || 0);
      }

      setSelectedRows([]);
    } catch (error) {
      toast({
        title: "Error fetching payments",
        description: "There was a problem loading the payments.",
        variant: "destructive",
      });
      setPayments(null);
    } finally {
      setIsLoading(false);
    }
  }, [year, page, itemsPerPage, search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDelete = async (paymentId: string) => {
    try {
      const success = await deletePayment(paymentId);
      if (success) {
        toast({
          title: "Payment deleted",
          description: "The payment was successfully deleted.",
        });
        // Refresh the payments
        fetchPayments();
        return true;
      } else {
        throw new Error("Failed to delete payment");
      }
    } catch (error) {
      toast({
        title: "Error deleting payment",
        description: "There was a problem deleting the payment.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteSelected = async () => {
    try {
      let success = true;
      for (const id of selectedRows) {
        const result = await deletePayment(id);
        if (!result) success = false;
      }

      if (success) {
        toast({
          title: "Payments deleted",
          description: `${selectedRows.length} payments were successfully deleted.`,
        });
        fetchPayments();
        return true;
      } else {
        throw new Error("Some payments could not be deleted");
      }
    } catch (error) {
      toast({
        title: "Error deleting payments",
        description:
          "There was a problem deleting some or all of the selected payments.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    payments,
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
    fetchPayments,
  };
};
