"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export interface UpsertPurchaseData {
  year: string;
  calendarId: string;
  contactId: string;
  purchaseId: string;
  startDate: Date;
  endDate: Date;
  frequency: number;
  purchaseData: Record<
    string,
    {
      selectedDates: {
        month: number;
        slot: number;
        checked?: boolean;
        date: Date | null;
      }[];
      charge?: number;
      quantity?: number;
    }
  >;
}

export async function upsertPurchase(data: UpsertPurchaseData) {
  const session = await auth();
  if (!session) {
    return {
      status: 401,
      json: {
        success: false,
        message: "Not authenticated",
      },
    };
  }
  const userId = session.user?.id;

  const { year, calendarId, contactId, purchaseData, frequency, startDate, endDate, purchaseId } = data;
  try {
    const result = await prisma.$transaction(async (prisma) => {

      const amountOwed = Object.values(purchaseData).reduce(
        (acc, { charge = 0 }) => acc + charge,
        0
      );

      let purchaseOverview = await prisma.purchaseOverview.findFirst({
        where: {
          year: parseInt(year),
          contactId,
          editionId: calendarId,
          id: purchaseId,
        },
      });

      if (purchaseOverview) {
        console.log("updating purchase overview");
        await prisma.purchaseOverview.update({
          where: { id: purchaseOverview.id },
          data: {
            year: parseInt(year),
            contactId,
            editionId: calendarId,
            amountOwed: amountOwed,
            paymentStartDate: startDate,
            paymentEndDate: endDate,
            paymentsMade: 0,
            paymentStatus: "Pending",
            paymentFrequency: frequency,
            paymentType: "Weekly",
          },
        });
      } else {
        purchaseOverview = await prisma.purchaseOverview.create({
          data: {
            userId,
            year: parseInt(year),
            contactId,
            editionId: calendarId,
            amountOwed: amountOwed,
            paymentStartDate: startDate,
            paymentEndDate: endDate,
            paymentsMade: 0,
            paymentStatus: "Pending",
            paymentFrequency: frequency,
            paymentType: "Weekly",
          },
        });
      }

      for (const [
        advertisementId,
        { selectedDates, charge, quantity },
      ] of Object.entries(purchaseData)) {
        let adPurchase = await prisma.advertisementPurchase.findFirst({
          where: {
            advertisementId,
            purchaseId: purchaseOverview.id,
          },
        });

        if (adPurchase) {
          
          await prisma.advertisementPurchase.update({
            where: { id: adPurchase.id },
            data: {
              charge: charge || 0,
              quantity: quantity || 0,
            },
          });
        } else {
          adPurchase = await prisma.advertisementPurchase.create({
            data: {
              advertisementId,
              purchaseId: purchaseOverview.id,
              charge: charge || 0,
              quantity: quantity || 0,
            },
          });
        }

        // Delete all slots for this purchase and re-add the selected ones
        await prisma.purchaseSlot.deleteMany({
          where: { advertisementPurchaseId: adPurchase.id },
        });

        for (const { month, slot, checked, date } of selectedDates) {
          console.log({ month, slot, checked, date });
          const slotExists = await prisma.purchaseSlot.findFirst({
            where: {
              advertisementPurchaseId: adPurchase.id,
              purchaseId: purchaseOverview.id,
              month,
              slot,
            },
          });
          console.log({ month, slot, checked, date }, slotExists);
          if (checked) {
            if (!slotExists) {
              await prisma.purchaseSlot.create({
                data: {
                  purchaseId: purchaseOverview.id,
                  advertisementPurchaseId: adPurchase.id,
                  month,
                  slot,
                  date,
                },
              });
              console.log({ month, slot, checked, date },"created");
            }
          } else {
            if (slotExists) {
              await prisma.purchaseSlot.delete({
                where: { id: slotExists.id },
              });
            }
          }
        }
      }
    },
    {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
    });
  } catch (error: any) {
    console.error("Error upserting purchase", error);
    return {
      status: 500,
      json: {
        success: false,
        message: "Error upserting purchase",
      },
    };
  }
  redirect(`/dashboard`);
}
