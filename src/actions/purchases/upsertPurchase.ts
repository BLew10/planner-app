"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import { PurchaseOverviewState } from "@/store/purchaseStore";
import { Prisma } from "@prisma/client";
// model PurchaseOverview {
//   adPurchases      AdvertisementPurchase[]
//   adPurchaseSlots  AdvertisementPurchaseSlot[]
//   @@unique([year, contactId])
// }
export async function upsertPurchase(
  data: PurchaseOverviewState | null,
  contactId: string,
  year: string,
  purchaseId: string
) {
  const session = await auth();
  if (!session || !data) return false;

  const userId = session.user.id;
  const calendarIds = Object.keys(data);
  const total = calculateTotalCharges(data);

  try {
    const total = calculateTotalCharges(data);

    const result = await prisma.$transaction(async (prisma) => {
      // Upsert the PurchaseOverview
      let purchaseOverview = await prisma.purchaseOverview.upsert({
        where: {
          id: purchaseId,
          userId: userId,
          year: parseInt(year),
        },
        update: {
          amountOwed: total,
          year: parseInt(year),
          calendarEditions: {
            connect: calendarIds.map((calendarId) => ({ id: calendarId })),
          },
        },
        create: {
          userId,
          contactId,
          year: parseInt(year),
          amountOwed: total,
          calendarEditions: {
            connect: calendarIds.map((calendarId) => ({ id: calendarId })),
          },
        },
      });
      const d = await prisma.advertisementPurchase.deleteMany({
        where: {
          purchaseId: purchaseOverview.id,
        },
      });
      const d2 = await prisma.advertisementPurchaseSlot.deleteMany({
        where: {
          purchaseId: purchaseOverview.id,
        },
      });
      // Upsert each AdvertisementPurchase and its related slots
      for (const [calendarId, ads] of Object.entries(data)) {
        for (const [adId, { quantity, charge, slots }] of Object.entries(ads)) {
          const adPurchase = await prisma.advertisementPurchase.create({
            data: {
              purchaseId: purchaseOverview.id,
              advertisementId: adId,
              charge: parseFloat(charge),
              quantity: parseInt(quantity),
            },
          });

          const slotRecords = slots?.map((slot) => ({
            advertisementPurchaseId: adPurchase.id,
            purchaseId: purchaseOverview.id,
            month: slot.month,
            slot: slot.slot,
            date: slot.date ? slot.date : null,
          }));

          if (slotRecords)
          await prisma.advertisementPurchaseSlot.createMany({
            data: slotRecords,
          });
        }
      }
    });

    return true;
  } catch (error) {
    console.error("Error upserting purchase", error);
    return false;
  }

  // try {
  //   const result = await prisma.$transaction(async (prisma) => {
  //     const adPurchasesData
  //     const purchaseDataUpdate: Prisma.PurchaseOverviewUpdateInput = {
  //       user: { connect: { id: userId } },
  //       contact: { connect: { id: contactId } },
  //       calendarEditions: {
  //         connect: calendarIds.map((id) => ({ id })),
  //       },
  //       year: Number(year),
  //       amountOwed: total,
  //       adPurchases: {
  //         createMany: {
  //           data: [],
  //         }
  //       },
  //       adPurchaseSlots: {
  //         createMany: {
  //           data: [],
  //         }
  //       }
  //     };

  //   },
  //   {
  //     maxWait: 5000, // default: 2000
  //     timeout: 10000, // default: 5000
  //   });

  //  return true
  // } catch (error: any) {
  //   console.error("Error upserting purchase", error);
  //   return false;
  // }
}

function calculateTotalCharges(
  purchaseOverview: PurchaseOverviewState
): number {
  let totalCharges = 0;

  for (const calendarData of Object.values(purchaseOverview)) {
    for (const adData of Object.values(calendarData)) {
      // Assuming charge is a string that represents a decimal number,
      // it should be converted to a number before summing up.
      const charge = parseFloat(adData.charge);
      if (!isNaN(charge)) {
        totalCharges += charge;
      }
    }
  }

  return totalCharges;
}
