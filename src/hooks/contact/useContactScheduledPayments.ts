import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/shadcn/use-toast";
import {
  getScheduledPaymentsByContactIdAndYear,
  updateSchedulePaymentLateFeesByYear,
} from "@/lib/data/scheduledPayment";
import { ScheduledPayment } from "@prisma/client";

interface UseContactScheduledPaymentsOptions {
  contactId: string;
  year: string;
}

interface PaymentWaiverUpdate {
  id: string;
  waived: boolean;
}

export const useContactScheduledPayments = ({
  contactId,
  year,
}: UseContactScheduledPaymentsOptions) => {
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[] | null>(null);
  const [paymentWaivers, setPaymentWaivers] = useState<PaymentWaiverUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScheduledPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const paymentsData = await getScheduledPaymentsByContactIdAndYear(contactId, year);
      setScheduledPayments(paymentsData);

      if (paymentsData) {
        setPaymentWaivers(
          paymentsData.map(payment => ({
            id: payment.id,
            waived: payment.lateFeeWaived
          }))
        );
      }
    } catch (error) {
      toast({
        title: "Error fetching scheduled payments",
        description: "There was a problem loading the scheduled payment information.",
        variant: "destructive",
      });
      setScheduledPayments(null);
    } finally {
      setIsLoading(false);
    }
  }, [contactId, year]);

  const updateLateFees = async () => {
    try {
      const result = await updateSchedulePaymentLateFeesByYear(paymentWaivers);
      if (result) {
        toast({
          title: "Changes successfully saved!",
          description: "Late fee waivers have been updated.",
          variant: "default",
        });
      } else {
        toast({
          title: "Failed to waive late fees",
          description: "Please try again.",
          variant: "destructive",
        });
      }
      return result;
    } catch (error) {
      toast({
        title: "Error updating late fees",
        description: "There was a problem updating the late fee waivers.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleWaiverChange = (paymentId: string, waived: boolean) => {
    setPaymentWaivers(current =>
      current.map(waiver =>
        waiver.id === paymentId ? { ...waiver, waived } : waiver
      )
    );
  };

  useEffect(() => {
    fetchScheduledPayments();
  }, [fetchScheduledPayments]);

  return {
    scheduledPayments,
    paymentWaivers,
    handleWaiverChange,
    isLoading,
    refetch: fetchScheduledPayments,
    updateLateFees,
  };
};
