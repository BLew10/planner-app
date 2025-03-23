"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

// Define proper types
interface MonthData {
  projected: number;
  actual: number;
}

interface CashFlowEntry {
  name: string;
  isInactive?: boolean;
  months: Record<string, MonthData>;
  yearTotal: {
    projected: number;
    actual: number;
  };
}

export const getCashFlowData = async (year: string, company: string = "All") => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // First, fetch all purchases matching our criteria
    const data = await prisma.purchaseOverview.findMany({
      where: {
        userId,
        // Make sure we have scheduled payments for this year
        paymentOverview: {
          scheduledPayments: {
            some: {
              year: Number(year)
            }
          }
        },
        // Filter by company if specified
        ...(company !== "All" && {
          contact: {
            contactContactInformation: {
              company: {
                contains: company,
                mode: "insensitive",
              },
            },
          },
        }),
      },
      include: {
        contact: {
          include: {
            contactContactInformation: true,
          },
        },
        paymentOverview: {
          include: {
            // Include scheduled payments for projections
            scheduledPayments: {
              where: {
                year: Number(year)
              },
              orderBy: {
                month: "asc",
              },
            },
          },
        },
        // Include all payments for this purchase
        payments: true
      },
    });

    // Transform the data for the cash flow report
    const transformedData: CashFlowEntry[] = data.map((purchase) => {
      // Initialize monthly data structure with projected amounts from scheduled payments
      const monthlyData: Record<string, MonthData> = {};
      
      // Use scheduled payments to determine the projected amounts by month
      const scheduledPayments = purchase.paymentOverview?.scheduledPayments || [];
      const amountOwed = Number(purchase.amountOwed) || 0;
      
      // Add projected amounts from scheduled payments
      scheduledPayments.forEach(payment => {
        const monthIndex = payment.month - 1;
        const monthName = MONTHS[monthIndex];
        
        // Use the scheduled payment amount for projections
        monthlyData[monthName] = {
          projected: Number(payment.amount) || 0,
          actual: 0  // Initialize actual to 0, will update with payments
        };
      });
      
      // Track total actual payments for the year to calculate remaining projected amount
      let totalActualForYear = 0;
      
      // Calculate actual payments per month
      purchase.payments.forEach(payment => {
        // Convert payment date string to Date object to extract month
        const paymentDate = new Date(payment.paymentDate);
        const paymentAmount = Number(payment.amount) || 0;
        
        // Only include payments from the selected year
        if (paymentDate.getFullYear() === Number(year)) {
          const monthIndex = paymentDate.getMonth();
          const monthName = MONTHS[monthIndex];
          
          // Create the month entry if it doesn't exist yet
          if (!monthlyData[monthName]) {
            monthlyData[monthName] = {
              projected: 0,
              actual: 0
            };
          }
          
          // Add the payment amount to the actual for this month
          monthlyData[monthName].actual += paymentAmount;
          
          // Track the total actual payments for the year
          totalActualForYear += paymentAmount;
          
          // If this payment wasn't projected (no scheduled payment for this month),
          // add it to the projected amount for this month as well
          // This handles prepayments that weren't in the original schedule
          if (monthlyData[monthName].projected === 0) {
            monthlyData[monthName].projected = paymentAmount;
          }
        }
      });
      
      // Calculate the total projected amount from monthly data
      const totalProjectedFromMonthly = Object.values(monthlyData).reduce(
        (sum, month) => sum + month.projected, 0
      );
      
      // If there's a discrepancy between the amount owed and the sum of projections,
      // adjust the projections proportionally
      if (totalProjectedFromMonthly !== 0 && Math.abs(totalProjectedFromMonthly - amountOwed) > 0.01) {
        const scalingFactor = amountOwed / totalProjectedFromMonthly;
        
        // Scale each month's projection
        Object.keys(monthlyData).forEach(month => {
          monthlyData[month].projected *= scalingFactor;
        });
      }
      
      // Use purchase.amountOwed for the projected total
      const projectedTotal = amountOwed;
      
      const actualTotal = purchase.payments.reduce(
        (sum, payment) => {
          // Only count payments from the selected year
          const paymentDate = new Date(payment.paymentDate);
          if (paymentDate.getFullYear() === Number(year)) {
            return sum + Number(payment.amount || 0);
          }
          return sum;
        },
        0
      );

      return {
        name:
          purchase.contact?.contactContactInformation?.company ||
          `${purchase.contact?.contactContactInformation?.firstName} ${purchase.contact?.contactContactInformation?.lastName}`,
        isInactive: purchase.contact?.isDeleted,
        months: monthlyData,
        yearTotal: {
          projected: projectedTotal,
          actual: actualTotal,
        },
      };
    });

    return transformedData;
  } catch (error) {
    console.error("Error in getCashFlowData:", error);
    throw error;
  }
};
