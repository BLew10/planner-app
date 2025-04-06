import { create } from "zustand";

export interface ScheduledPayment {
  dueDate: Date;
  month: number;
  year: number;
  amount: number | null;
  isPaid?: boolean;
  paymentDate?: string;
  checked?: boolean;
}

export interface PaymentOverview {
  id: string;
  purchaseId: string;
  net?: number;
  calendarEditionYear: number;
  contactId?: string;
  totalSale: number;
  additionalDiscount1?: number;
  additionalDiscount2?: number;
  additionalSales1?: number;
  additionalSales2?: number;
  trade?: number;
  earlyPaymentDiscount?: number;
  earlyPaymentDiscountPercent?: number;
  amountPrepaid?: number;
  paymentMethod?: string;
  checkNumber?: string;
  paymentDueOn?: number;
  paymentOnLastDay: boolean;
  lateFee?: number;
  lateFeePercent?: number;
  deliveryMethod: string;
  cardType: string;
  cardNumber?: string;
  cardExpirationDate?: Date;
  invoiceMessage?: string;
  statementMessage?: string;
  scheduledPayments: ScheduledPayment[];
  splitPaymentsEqually?: boolean;
}

interface PaymentStore {
  paymentOverview: PaymentOverview;
  addPaymentOverview: (newOverview: PaymentOverview) => void;
  updateKeyValue: (key: keyof PaymentOverview, value: any) => void;
  organziePaymentsByYear: () => { [key: number]: ScheduledPayment[] };
  calculateNet: () => void;
  reset: () => void;
}

export const usePaymentOverviewStore = create<PaymentStore>((set, get) => ({
  paymentOverview: {} as PaymentOverview,
  scheduledPayments: [],

  addPaymentOverview: (newOverview) => {
    const overviews = get().paymentOverview;
    set({
      paymentOverview: { ...overviews, [newOverview.id]: newOverview },
    });
  },

  updateKeyValue: (key: keyof PaymentOverview, value: any) => {
    const overview = get().paymentOverview;
    set({
      paymentOverview: { ...overview, [key]: value },
    });
  },
  organziePaymentsByYear: () => {
    const overview = get().paymentOverview;
    const payments = overview.scheduledPayments || [];
    const groupedPayments = payments.reduce((acc, payment) => {
      const year = payment.year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(payment);
      return acc;
    }, {} as { [key: number]: ScheduledPayment[] });

    return groupedPayments || {};
  },

  calculateNet: () => {
    const overview = get().paymentOverview;
    const {
      additionalDiscount1,
      additionalDiscount2,
      additionalSales1,
      additionalSales2,
      amountPrepaid,
      earlyPaymentDiscount,
      totalSale,
      earlyPaymentDiscountPercent,
      trade,
    } = overview;

    // Calculate net - ensure all values are numbers
    const numTotalSale = Number(totalSale || 0);
    const numAmountPrepaid = Number(amountPrepaid || 0);
    const earlyDiscount = earlyPaymentDiscount
      ? Number(earlyPaymentDiscount)
      : (Number(earlyPaymentDiscountPercent || 0) / 100) * numTotalSale;

    const net =
      numTotalSale -
      numAmountPrepaid -
      earlyDiscount -
      Number(additionalDiscount1 || 0) -
      Number(additionalDiscount2 || 0) +
      Number(additionalSales1 || 0) +
      Number(additionalSales2 || 0) -
      Number(trade || 0);

    set({
      paymentOverview: {
        ...overview,
        net: net,
      },
    });
  },
  reset: () => {
    set({ paymentOverview: {} as PaymentOverview });
  },
}));
