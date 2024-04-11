"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { formatDateToString } from "@/lib/helpers/formatDateToString";

export interface UpsertPurchaseData {
  year: string;
  calendarId: string;
  contactId: string;
  purchaseId: string;
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

  const { year, calendarId, contactId, purchaseData, purchaseId } = data;
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
        await prisma.advertisementPurchaseSlot.deleteMany({
          where: { advertisementPurchaseId: adPurchase.id },
        });

        for (const { month, slot, checked, date } of selectedDates) {
          const slotExists = await prisma.advertisementPurchaseSlot.findFirst({
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
              await prisma.advertisementPurchaseSlot.create({
                data: {
                  purchaseId: purchaseOverview.id,
                  advertisementPurchaseId: adPurchase.id,
                  month,
                  slot,
                  date: date ? formatDateToString(date) : null,
                },
              });
            }
          } else {
            if (slotExists) {
              await prisma.advertisementPurchaseSlot.delete({
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

    return {
      status: 200,
      json: {
        success: true,
        message: "Purchase upserted successfully",
      },
    };
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
}
