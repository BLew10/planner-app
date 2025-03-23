"use server";

import prisma from "@/lib/prisma/prisma";
import {
  Contact,
  PurchaseOverview,
  ContactContactInformation,
  CalendarEdition,
} from "@prisma/client";
import { auth } from "@/auth";
import { PurchaseOverviewModel } from "../models/purchaseOverview";
import { AdvertisementPurchaseSlotModel } from "../models/advertisementPurchaseSlots";
import { flagLatePayments } from "./paymentOverview";
import { formatDateToString, serializeReturn } from "../helpers";

export interface Purchase {
  id: string;
  calendarEditionYear: number;
  adPurchases: {
    id: string;
    charge: number;
    quantity: number;
    calendarName: string;
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
  contactId: string | undefined = "-1",
  calendarEditionYear: string
): Promise<Partial<PurchaseOverviewModel> | null> => {
  const session = await auth();
  if (!session) {
    return null;
  }

  const userId = session.user.id;
  await flagLatePayments(userId);
  const purchase = await prisma.purchaseOverview.findFirst({
    where: {
      contactId: contactId,
      userId,
      calendarEditionYear: Number(calendarEditionYear),
      isDeleted: false,
    },
    select: {
      id: true,
      paymentOverviewId: true,
      calendarEditions: true,
      adPurchaseSlots: {
        include: {
          advertisementPurchase: true,
        },
      },
      adPurchases: {
        include: {
          advertisement: true,
        },
      },
      paymentOverview: {
        include: {
          scheduledPayments: true,
          payments: true,
        },
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
  paymentOverviewId: string | null;
  amountOwed: number;
  contactId: string;
  companyName: string;
  calendarEditionYear: number;
  calendarEditions: string;
  purchasedOn: string;
  total: number;
  amountPaid: number;
}
export const getPurchaseTableData = async (
  calendarEditionYear: string
): Promise<PurchaseTableData[] | null> => {
  const session = await auth();
  if (!session) {
    return null;
  }

  const userId = session.user.id;

  const purchases = await prisma.purchaseOverview.findMany({
    where: {
      userId,
      calendarEditionYear: Number(calendarEditionYear),
      isDeleted: false,
    },
    select: {
      id: true,
      amountOwed: true,
      createdAt: true,
      calendarEditionYear: true,
      paymentOverviewId: true,
      paymentOverview: {
        select: {
          amountPaid: true,
          net: true,
          scheduledPayments: {
            where: {
              isLate: true,
              lateFeeWaived: false,
              lateFeeAddedToNet: true,
            },
          },
        },
      },
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
    const calendarsEditions = purchase.calendarEditions
      .map((e) => e.code)
      .join(", ");

    return {
      id: purchase.id,
      paymentOverviewId: purchase.paymentOverviewId || null,
      amountOwed: parseFloat(purchase.amountOwed.toString()) || 0,
      contactId: purchase.contact.id,
      companyName: purchase.contact?.contactContactInformation?.company || "",
      calendarEditionYear: purchase.calendarEditionYear,
      calendarEditions: calendarsEditions,
      purchasedOn: formatDateToString(purchase.createdAt),
      total: Number(purchase.paymentOverview?.net || 0),
      amountPaid: Number(purchase.paymentOverview?.amountPaid || 0),
    };
  });

  return serializeReturn(allPurchases);
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
  calendarEditionYear: string
): Promise<PurchaseSlot[] | null> => {
  const session = await auth();
  if (!session || !session.user || !calendarId || !calendarEditionYear) {
    return null;
  }

  const userId = session.user.id;
  const purchases = await prisma.advertisementPurchaseSlot.findMany({
    where: {
      isDeleted: false,
      month: monthIndex,
      purchaseOverview: {
        userId,
        calendarEditionYear: Number(calendarEditionYear),
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
          calendarEditionYear: true,
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
      calendarEditionYear: true,
      adPurchases: {
        select: {
          id: true,
          charge: true,
          quantity: true,
          calendar: true,
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
  const purchasesData: Partial<Purchase>[][] | null = purchases.map((p) => {
    return p.adPurchases.map((purchase) => ({
      id: purchase.id,
      calendarEditionYear: p.calendarEditionYear,
      calendarName: purchase.calendar.name,
      charge: parseFloat(purchase.charge.toString()),
      quantity: purchase.quantity,
      advertisement: {
        id: purchase.advertisement.id,
        name: purchase.advertisement.name,
      },
      slots: purchase.adPurchaseSlots,
    }));
  });

  return purchasesData;
};

export interface SlotInfo {
  id?: string;
  month: number;
  slot: number | null;
  date?: string;
  contactCompany?: string;
  added?: boolean;
  advertisementId?: string;
}

export const getAllSlotsByCalendarEditionYearAndCalendarId = async (
  calendarId: string,
  calendarEditionYear: string,
  adTypeIds: (string | undefined)[]
): Promise<Record<string, SlotInfo[]> | null> => {
  const session = await auth();
  if (!session || !calendarId || !calendarEditionYear || !adTypeIds.length) {
    return null;
  }
  const filteredAdTypeIds = adTypeIds.filter((id): id is string => !!id);
  try {
    const slots = await prisma.advertisementPurchaseSlot.findMany({
      where: {
        isDeleted: false,
        calendarId,
        calendarEditionYear: Number(calendarEditionYear),
        advertisementId: { in: filteredAdTypeIds },
      },
      include: {
        contact: {
          select: {
            contactContactInformation: {
              select: {
                company: true,
              },
            },
          },
        },
        advertisementPurchase: {
          include: {
            advertisement: true,
          },
        },
      },
    });

    // Group slots by advertisementId
    const groupedSlots: Record<string, SlotInfo[]> = {};
    slots.forEach((slot: Partial<AdvertisementPurchaseSlotModel>) => {
      const adId = slot?.advertisementId;
      if (adId) {
        if (!groupedSlots[adId]) {
          groupedSlots[adId] = [];
        }
        groupedSlots[adId].push({
          id: slot.id || "",
          month: slot.month || 0,
          slot: slot.slot || 0,
          date: slot.date || "",
          contactCompany:
            slot.contact?.contactContactInformation?.company || "",
        });
      }
    });
    return groupedSlots;
  } catch (error) {
    console.error(
      `Error getting slots for calendar ${calendarId} and calendar edition year ${calendarEditionYear}: ${error}`
    );
    return null;
  }
};

interface AdvertisementSlots {
  name: string;
  slots: SlotInfo[];
}

export interface CalendarSlots {
  name: string;
  ads: Record<string, AdvertisementSlots>;
}
export const getAllSlotsFromPurchase = async (
  purchaseId: string
): Promise<Record<string, CalendarSlots> | null> => {
  const session = await auth();
  if (!session || !purchaseId) {
    return null;
  }
  try {
    const slots = await prisma.advertisementPurchaseSlot.findMany({
      where: {
        isDeleted: false,
        purchaseId,
      },
      include: {
        calendar: true,
        contact: {
          select: {
            contactContactInformation: {
              select: {
                company: true,
              },
            },
          },
        },
        advertisementPurchase: {
          include: {
            advertisement: true,
          },
        },
      },
    });

    const groupedSlots: Record<string, CalendarSlots> = {};

    slots.forEach((slot) => {
      const calendarId = slot.calendar?.id;
      const calendarName = slot.calendar?.name;
      const adId = slot.advertisementPurchase?.advertisementId;
      const adName = slot.advertisementPurchase?.advertisement.name;
      const companyName = slot.contact?.contactContactInformation?.company;

      if (calendarId && adId) {
        if (!groupedSlots[calendarId]) {
          groupedSlots[calendarId] = {
            name: calendarName || "",
            ads: {},
          };
        }
        if (!groupedSlots[calendarId].ads[adId]) {
          groupedSlots[calendarId].ads[adId] = {
            name: adName || "",
            slots: [],
          };
        }
        groupedSlots[calendarId].ads[adId].slots.push({
          month: slot.month || 0,
          slot: slot.slot || 0,
          date: slot.date || "",
          contactCompany: companyName || "",
          advertisementId: slot.advertisementPurchase?.advertisementId || "",
        });
      }
    });

    return groupedSlots;
  } catch (error) {
    console.error(`Error getting slots for purchase ${purchaseId}: ${error}`);
    return null;
  }
};

export const getPurchaseById = async (
  id: string
): Promise<Partial<PurchaseOverviewModel> | null> => {
  const session = await auth();
  if (!session) {
    return null;
  }

  try {
    const purchase = await prisma.purchaseOverview.findUnique({
      where: {
        id,
      },
      include: {
        contact: {
          include: {
            contactContactInformation: true,
          },
        },
      },
    });

    if (!purchase) {
      return null;
    }

    return purchase;
  } catch (error) {
    console.error(`Error getting purchase ${id}: ${error}`);
    return null;
  }
};

export const getTakenSlots = async (calendarEditionYear: string, calendarId: string, contactId: string, adId: string) => {
  try {
    const slots = await prisma.advertisementPurchaseSlot.findMany({
      where: {
        isDeleted: false,
        calendarEditionYear: Number(calendarEditionYear),
        calendarId,
        advertisementId: adId,
        contactId: {
          not: contactId
        }
      },
      select: {
        id: true,
        slot: true,
        date: true,
        month: true,
        contact: {
          select: {
            id: true,
            contactContactInformation: {
              select: {
                company: true,
              },
            },
          },
        }
      },
    });

    return slots;
  } catch (error) {
    console.error(
      `Error getting slots for calendar ${calendarId} and calendar edition year ${calendarEditionYear}: ${error}`
    );
    return null;
  }
};
