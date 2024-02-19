"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export interface UpsertPurchaseData {
  year: string;
  calendarId: string;
  contactId: string;
  purchaseData: Record<
    string,
    {
      selectedDates: { month: number; slot: number; checked: boolean }[];
      charge?: number;
      quantity?: number;
    }
  >;
}

export async function upsertPurchase(data: UpsertPurchaseData) {
  console.log("Upserting purchase", data);
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

  const { year, calendarId, contactId, purchaseData } = data;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      for (const [
        advertisementId,
        { selectedDates, charge, quantity },
      ] of Object.entries(purchaseData)) {
        let adPurchase = await prisma.advertisementPurchase.findFirst({
          where: {
            advertisementId,
            year: parseInt(year),
            contactId,
            editionId: calendarId,
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
              contactId,
              userId,
              charge: charge || 0,
              editionId: calendarId,
              year: parseInt(year),
              quantity: quantity || 0,
            },
          });
        }


        // Delete all slots for this purchase and re-add the selected ones
        await prisma.purchaseSlot.deleteMany({
          where: { advertisementPurchaseId: adPurchase.id },
        });

        for (const { month, slot, checked } of selectedDates) {
          const slotExists = await prisma.purchaseSlot.findFirst({
            where: {
              advertisementPurchaseId: adPurchase.id,
              month,
              slot,
            },
          });
          if (checked) {
            if (!slotExists) {
              await prisma.purchaseSlot.create({
                data: {
                  advertisementPurchaseId: adPurchase.id,
                  month,
                  slot,
                },
              });
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
    });
    console.log("Upserted purchase", result);
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
