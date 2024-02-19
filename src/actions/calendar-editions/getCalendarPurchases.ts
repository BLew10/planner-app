"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";

export interface PurchaseByMonth {
    [key: number]: PurchaseSlotDetails[];
  }
  
  export interface PurchaseSlotDetails {
    month: number;
    slot: number;
    advertisementPurchase: {
      advertisement: {
        name: string;
        id: string;
      };
    };
  }
  

export const getCalendarPurchases = async (formData: FormData): Promise<PurchaseByMonth | null>=> {
    const session = await auth();
    if (!session || !session.user) {
      return null;
    }

    const year = Number(formData.get("year")?.toString()) || -1;
    const calendarId = formData.get("calendarId")?.toString() || "-1";
  
    const userId = session.user.id;
    const purchases = await prisma.purchaseSlot.findMany({
      where: {
        advertisementPurchase: {
          userId,
          year: year,
          editionId: calendarId,
        },
      },
      select: {
        id: true,
        month: true,
        slot: true,
        advertisementPurchase: {
          select: {
            advertisement: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        month: "asc",
      },
    });
  
    const purchasesByMonth = purchases.reduce((acc, curr) => {
      const month = curr.month;
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(curr);
      return acc;
    }, {} as { [key: number]: { month: number; slot: number; advertisementPurchase: { advertisement: { name: string, id: string } } }[] });
  
    return purchasesByMonth;
  };
  