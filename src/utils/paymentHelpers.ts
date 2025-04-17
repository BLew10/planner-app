import { ScheduledPayment } from "@prisma/client";

export const getNextPaymentDate = (
  scheduledPayments: ScheduledPayment[] | null
) => {
  if (!scheduledPayments || scheduledPayments.length === 0) {
    return { dueDate: "", isLate: false };
  }

  // Sort the unpaid payments by due date
  const unpaidPayments = scheduledPayments
    .filter((payment) => !payment.isPaid)
    .sort((a, b) => {
      // Convert string dates to Date objects for proper comparison
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  if (unpaidPayments.length === 0) {
    return { dueDate: "", isLate: false };
  }

  // Return the earliest unpaid payment
  return {
    dueDate: unpaidPayments[0].dueDate,
    isLate: unpaidPayments[0].isLate,
  };
};
