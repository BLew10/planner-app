"use server";

import prisma from "@/lib/prisma/prisma";
import { AddressBook, Contact, PurchaseOverview, ContactContactInformation, CalendarEdition } from "@prisma/client";
import { auth } from "@/auth";


export interface Purchase {
  id: string;
  adPurchases: {
    id: string;
    charge: number;
    quantity: number;
    advertisement: {
      id: string;
      name: string;
    };
    slots?: {
      id: string;
      slot: number;
      month: number;
      date: Date | null;
    }[]
  }[];
}

export const getPurchaseById = async (
  purchaseId: string | undefined = '-1'
): Promise<Partial<Purchase> | null> => {
  const session = await auth();
  if (!session) {
    return null;
  }

  const userId = session.user.id;

  const purchase = await prisma.purchaseOverview.findFirst({
    where: {
      id: purchaseId,
      userId,
    },
    select: {
      id: true,
      adPurchases: {
        select: {
          id: true,
          charge: true,
          quantity: true,
          purchaseSlots: {
            select: {
              id: true,
              slot: true,
              month: true,
              date: true,
            }
          },
          advertisement: {
            select: {
              id: true,
              name: true,
            }
          }

        }
      }
    },
  });

  if (!purchase) {
    return null;
  }

  const adPurchases = purchase.adPurchases.map((purchase) => ({
    id: purchase.id,
    charge: parseFloat(purchase.charge.toString()),
    quantity: purchase.quantity,
    advertisement: {
      id: purchase.advertisement.id,
      name: purchase.advertisement.name,
    },
    slots: purchase.purchaseSlots
  }))

  const purchaseOverview: Partial<Purchase> = {
    id: purchase.id,
    adPurchases: adPurchases,
  }

  return purchaseOverview;
};

export interface PurchaseTableData {
  id: string;
  paymentScheduled: boolean;
  amountOwed: number;
  contactId: string;
  companyName: string;
  year: number;
  calendarEdition: string;
}
export const getAllPurchases = async (): Promise<
  PurchaseTableData[] | null
> => {
  const session = await auth();
  if (!session) {
    return null;
  }

  const userId = session.user.id;

  const purchases = await prisma.purchaseOverview.findMany({
    where: {
        userId,
    },
    select: {
      id: true,
      amountOwed: true,
      year: true,
      paymentId: true,
      calendarEdition: {
        select: {
          name: true
        }
      },
      Contact: {
          select: {
              id: true,
              contactContactInformation: {
                select: {
                  company: true,
                }
              }
          }
      }
    },
  });
  
  const allPurchases: PurchaseTableData[] = purchases.map((purchase) => {
    return {
      id: purchase.id,
      paymentScheduled: purchase.paymentId ? true : false,
      amountOwed: parseFloat(purchase.amountOwed.toString()) || 0,
      contactId: purchase.Contact.id,
      companyName: purchase.Contact?.contactContactInformation?.company || "",
      year: purchase.year,
      calendarEdition: purchase.calendarEdition?.name || ""
    }
  })

  return allPurchases;
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
  year: string
): Promise<PurchaseByMonth | null> => {
  const session = await auth();
  if (!session || !session.user || !calendarId || !year) {
    return null;
  }

  const userId = session.user.id;
  const purchases = await prisma.purchaseSlot.findMany({
    where: {
      purchaseOverview: {
        year: Number(year),
        editionId: calendarId,
        userId,
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
  }, {} as { [key: number]: { month: number; slot: number; advertisementPurchase: { advertisement: { name: string; id: string } } }[] });
  return purchasesByMonth;
};

export interface PurchaseSlot {
  id?: string | null;
  slot?: number | null;
  advertisementName?: string | null;
  advertisementId?: string | null;
  companyName?: string | null;
  contactId?: string | null;
  date?: Date | null;
}

export const getPurchasesByMonthCalendarIdAndYear = async (
  monthIndex: number,
  calendarId: string,
  year: string
): Promise<PurchaseSlot[] | null> => {
  const session = await auth();
  if (!session || !session.user || !calendarId || !year) {
    return null;
  }

  const userId = session.user.id;
  const purchases = await prisma.purchaseSlot.findMany({
    where: {
      month: monthIndex,
        purchaseOverview: {
          userId,
          year: Number(year),
          editionId: calendarId,
      },
    },
    select: {
      id: true,
      slot: true,
      date: true,
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
      purchaseOverview: {
        select: {
          year: true,
          editionId: true,
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
      date: purchase.date,
      advertisementName: purchase.advertisementPurchase.advertisement.name,
      advertisementId: purchase.advertisementPurchase.advertisement.id,
      companyName:
        purchase.purchaseOverview?.Contact?.contactContactInformation?.company,
      contactId: purchase.purchaseOverview?.Contact.id,
    };
  });

  return monthData;
};


export interface ContactInfo extends Contact {
  contactContactInformation?: Partial<ContactContactInformation> | null;
}

export interface PurchaseInfo extends PurchaseOverview {
  calendarEdition: CalendarEdition;
}

export const getPurchasesWithoutPayment = async (contactId: string): Promise<PurchaseInfo[] | null> => {
  const session = await auth();
  if (!session) {
    return null;
  }
  const userId = session.user.id;

  const purchasesWithoutPayment: PurchaseInfo[] = await prisma.purchaseOverview.findMany({
    where: {
      paymentId: null,
      userId,
      contactId
    },
    include: {
      calendarEdition: true,
    }
  });

  if (!purchasesWithoutPayment || purchasesWithoutPayment.length === 0) {
    return null;
  }


  return purchasesWithoutPayment;
}