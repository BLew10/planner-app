import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import { getPaymentsByContactId } from "@/lib/data/payment";
import { PaymentModel } from "@/lib/models/payment";

interface UseContactPaymentsOptions {
  contactId: string;
  year: string;
}

export const useContactPayments = ({ contactId, year }: UseContactPaymentsOptions) => {
  const [payments, setPayments] = useState<Partial<PaymentModel>[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const paymentsData = await getPaymentsByContactId(contactId, year);
      setPayments(paymentsData);
    } catch (error) {
      toast({
        title: "Error fetching payments",
        description: "There was a problem loading the payment information.",
        variant: "destructive",
      });
      setPayments(null);
    } finally {
      setIsLoading(false);
    }
  }, [contactId, year]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    isLoading,
    refetch: fetchPayments,
  };
};