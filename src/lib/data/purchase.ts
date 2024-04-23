"use server";

import prisma from "@/lib/prisma/prisma";
import {
  AddressBook,
  Contact,
  PurchaseOverview,
  ContactContactInformation,
  CalendarEdition,
} from "@prisma/client";
import { auth } from "@/auth";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import { PurchaseOverviewModel } from "../models/purchaseOverview";

export interface Purchase {
  id: string;
  year: number;
  calendarEdition: string
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
      date: string | null;
    }[];
  }[];
}

export const getPurchaseByContactIdAndYear = async (
  contactId: string | undefined = "-1", year: string
): Promise<Partial<PurchaseOverviewModel> | null> => {
  const session = await auth();
  if (!session) {
    return null;
  }

  const userId = session.user.id;

  const purchase = await prisma.purchaseOverview.findFirst({
    where: {
      contactId: contactId,
      userId,
      year: Number(year),
      isDeleted: false,
    },
    select: {
      id: true,
      calendarEditions: true,
      adPurchases: {
        include: {
          advertisement: true,
          adPurchaseSlots: true,
        }
      },
    },
  });

  if (!purchase) {
    return null;
  }

  return purchase;
};

export interface PurchaseTableData {
  id: string;
  paymentScheduled: boolean;
  amountOwed: number;
  contactId: string;
  companyName: string;
  year: number;
  calendarEditions: string;
}
export const getPurchaseTableData = async (year: string): Promise<
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
      year: Number(year),
      isDeleted: false,
    },
    select: {
      id: true,
      amountOwed: true,
      year: true,
      paymentId: true,
      calendarEditions: {
        select: {
          code: true,
        },
      },
      contact: {
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
  });

  const allPurchases: PurchaseTableData[] = purchases.map((purchase) => {
    const calendarsEditions = purchase.calendarEditions.map((e) => e.code).join(", ");
    return {
      id: purchase.id,
      paymentScheduled: purchase.paymentId ? true : false,
      amountOwed: parseFloat(purchase.amountOwed.toString()) || 0,
      contactId: purchase.contact.id,
      companyName: purchase.contact?.contactContactInformation?.company || "",
      year: purchase.year,
      calendarEditions: calendarsEditions,
    };
  });

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
  const purchases = await prisma.advertisementPurchaseSlot.findMany({
    where: {
      isDeleted: false,
      purchaseOverview: {
        year: Number(year),
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
  date?: string | null;
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
  const purchases = await prisma.advertisementPurchaseSlot.findMany({
    where: {
      isDeleted: false,
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
          contact: {
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
    console.log(purchase.date);
    return {
      id: purchase.id,
      slot: purchase.slot,
      date: purchase.date,
      advertisementName: purchase.advertisementPurchase.advertisement.name,
      advertisementId: purchase.advertisementPurchase.advertisement.id,
      companyName:
        purchase.purchaseOverview?.contact?.contactContactInformation?.company,
      contactId: purchase.purchaseOverview?.contact.id,
    };
  });

  return monthData;
};

export interface ContactInfo extends Contact {
  contactContactInformation?: Partial<ContactContactInformation> | null;
}

export interface PurchaseInfo extends PurchaseOverview {
  calendarEditions: CalendarEdition[] | null;
}

export const getPurchasesWithoutPayment = async (
  contactId: string
): Promise<PurchaseInfo[] | null> => {
  const session = await auth();
  if (!session) {
    return null;
  }
  const userId = session.user.id;

  const purchasesWithoutPayment: PurchaseInfo[] =
    await prisma.purchaseOverview.findMany({
      where: {
        paymentId: null,
        userId,
        contactId,
        isDeleted: false,
      },
      include: {
        calendarEditions: true,
      },
    });

  if (!purchasesWithoutPayment || purchasesWithoutPayment.length === 0) {
    return null;
  }

  return purchasesWithoutPayment;
};

export const getPurchasesByContactId = async (
  contactId: string | undefined = "-1"
): Promise<Partial<Purchase>[][] | null> => {
  const session = await auth();
  if (!session) {
    return null;
  }

  const userId = session.user.id;
  const purchases = await prisma.purchaseOverview.findMany({
    where: {
      contactId: contactId,
      userId,
      isDeleted: false,
    },
    select: {
      id: true,
      calendarEditions: true,
      year: true,
      adPurchases: {
        select: {
          id: true,
          charge: true,
          quantity: true,
          adPurchaseSlots: {
            select: {
              id: true,
              slot: true,
              month: true,
              date: true,
            },
          },
          advertisement: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!purchases) {
    return null;
  }
  const purchasesData: Partial<Purchase>[][] | null = purchases.map(
    (p) => {
      const calendarEditions = p.calendarEditions.map(e=> e.code).join(", ");
      return p.adPurchases.map((purchase) => ({
        id: purchase.id,
        year: p.year,
        calendarEditions: calendarEditions,
        charge: parseFloat(purchase.charge.toString()),
        quantity: purchase.quantity,
        advertisement: {
          id: purchase.advertisement.id,
          name: purchase.advertisement.name,
        },
        slots: purchase.adPurchaseSlots,
      }));
    }
  );

  return purchasesData;
};
