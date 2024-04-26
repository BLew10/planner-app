"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { PurchaseOverviewState } from "@/store/purchaseStore";

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
  try {
    const total = calculateTotalCharges(data);
    console.log("total", total);

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
            set: [],
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
          if (!quantity || !charge || !slots) continue;
          const adPurchase = await prisma.advertisementPurchase.create({
            data: {
              purchaseId: purchaseOverview.id,
              advertisementId: adId,
              charge: parseFloat(charge),
              quantity: parseInt(quantity),
              calendarId: calendarId,
            },
          });

          const slotRecords = slots?.map((slot) => ({
            advertisementPurchaseId: adPurchase.id,
            purchaseId: purchaseOverview.id,
            month: slot.month,
            slot: slot.slot,
            date: slot.date ? slot.date : null,
            calendarId: calendarId,
            year: parseInt(year),
            advertisementId: adId,
            contactId: contactId,
          }));

          if (slotRecords)
          await prisma.advertisementPurchaseSlot.createMany({
            data: slotRecords,
          });
        }
      }
    }, {
      maxWait: 10000,
      timeout: 10000
    });

    return true;
  } catch (error) {
    console.error("Error upserting purchase", error);
    return false;
  }
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
