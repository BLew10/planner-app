"use server";

import prisma from "@/lib/prisma/prisma";
import { AddressBook, AdvertisementPurchase } from "@prisma/client";
import { auth } from "@/auth";

export const getPurchaseById = async (
  id: string
): Promise<Partial<AddressBook> | null> => {
  const session = await auth();
  return null;
};

export const getAllPurchases = async (): Promise<
  Partial<AddressBook>[] | null
> => {
  const session = await auth();
  return null;
};

export const getAdvertisementPurchasesByContactId = async (
  contactId: string
): Promise<Partial<AddressBook>[] | null> => {
  const session = await auth();
  return null;
};


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

export const getAdvertisementPurchasesByYearAndCalendarId = async (
  calendarId: string,
  year: number
): Promise<PurchaseByMonth | null>=> {
  const session = await auth();
  if (!session || !session.user || !calendarId || !year) {
    return null;
  }

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

export interface PurchaseSlot {
  id?: string | null;
  slot?: number | null;
  advertisementName?: string | null;
  advertisementId?: string | null;
  companyName?: string | null;
  contactId?: string | null;
}

export const getPurchasesByMonthCalendarIdAndYear = async (monthIndex: number, calendarId: string, year: number): Promise<PurchaseSlot[] | null> => {
  const session = await auth();
  if (!session || !session.user || !calendarId || !year) {
    return null;
  }

  const userId = session.user.id;
  const purchases = await prisma.purchaseSlot.findMany({
    where: {
      month: monthIndex,
      advertisementPurchase: {
        userId,
        year: year,
        editionId: calendarId,
      },
    },
    select: {
      id: true,
      slot: true,
      advertisementPurchase: {
        select: {
          advertisement: {
            select: {
              name: true,
              id: true,
            },
          },
          Contact: {
            select: {
              id: true,
              contactContactInformation: {
                select: {
                  company: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const monthData: PurchaseSlot[] = purchases.map((purchase) => {
    return {
      id: purchase.id,
      slot: purchase.slot,
      advertisementName: purchase.advertisementPurchase.advertisement.name,
      advertisementId: purchase.advertisementPurchase.advertisement.id,
      companyName: purchase.advertisementPurchase?.Contact?.contactContactInformation?.company,
      contactId: purchase.advertisementPurchase.Contact.id,
    };
  })

  return monthData;
}