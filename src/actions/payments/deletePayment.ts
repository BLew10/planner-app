"use server";

import prisma from "@/lib/prisma/prisma";
import { auth } from "@/auth";
import { PaymentStatusType } from "@/lib/constants";

const deletePayment = async (paymentId: string) => {
  try {
    await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: "Cancelled" as PaymentStatusType,
      },
    });

    console.log("Deleted payment", paymentId);
    return true;
  } catch (error: any) {
    console.error("Error deleting purchase", error);
    return false;
  }
};

export default deletePayment;
