"use server";

import prisma from "@/lib/prisma/prisma";
import { PaymentStatusType, PaymentFrequencyType } from "../constants";
import { auth } from "@/auth";
import { PurchaseOverviewModel } from "../models/purchaseOverview";
import Stripe from "stripe";
import { Payment } from "@prisma/client";
import { getStripePriceById, getStripeCustomerById } from "../helpers/stripeHelpers";

export interface PaymentTableData {
    id: string;
    totalOwed: number;
    status: string;
    totalPaid: number;
    totalPayments: number;
    startDate: Date;    
    anticipatedEndDate: Date;
    stripeScheduleId?: string;
    frequency: string;
    companyName: string;
    purchases?: Partial<PurchaseOverviewModel>[];
  }


export const getAllPayments = async (paymentStatus: PaymentStatusType): Promise<PaymentTableData[]> => {
    try {

        const session = await auth();
        const userId = session?.user?.id;
        const payments = await prisma.payment.findMany({
            where: {
                userId,
                status: paymentStatus,
                isDeleted: false
            }, 
            select: {
                id: true,
                totalOwed: true,
                status: true,
                totalPaid: true,
                totalPayments: true,
                startDate: true,
                anticipatedEndDate: true,
                frequency: true,
                stripeScheduleId: true,
                contact: {
                    select: {
                        contactContactInformation: {
                            select: {
                                company: true
                            }
                        }
                    }
                }
            }
        });

        const tableData: PaymentTableData[] = payments.map((payment) => formatTableData(payment));


        return tableData;
    } catch (e) {
        console.log(e);
        return [];
    }
}

export const getPaymentById = async (id: string) => {
    try {
        const payment = await prisma.payment.findFirst({
            where: {
                id,
                isDeleted: false
            },
            include: {
                contact: {
                    include: {
                        contactContactInformation: true
                    }
                },
                purchases: {
                    include: {
                        calendarEdition: true
                    }
                }
            }
        });
        return payment;
    } catch (e) {
        return null;
    }
}

export const getPaymentsByContactId = async (contactId: string): Promise<PaymentTableData[] | null>  => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const payments = await prisma.payment.findMany({
            where: {
                userId,
                contactId: contactId,
            }, 
            select: {
                id: true,
                totalOwed: true,
                status: true,
                totalPaid: true,
                totalPayments: true,
                startDate: true,
                anticipatedEndDate: true,
                frequency: true,
                stripeScheduleId: true,
                purchases: {
                    select: {
                        id: true,
                        year: true,
                        calendarEdition: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                contact: {
                    select: {
                        contactContactInformation: {
                            select: {
                                company: true
                            }
                        }
                    }
                }
            }
        });

        const tableData: PaymentTableData[] = payments.map((payment) => formatTableData(payment));

        return tableData;
    } catch (e) {
        return null;
    }
}

export const updatePaymentStatus = async (paymentId: string, status: PaymentStatusType) => {
    try {
        const payment = await prisma.payment.update({
            where: {
                id: paymentId
            },
            data: {
                status
            }
        });
        return payment
    } catch (e) {
        console.log('Error updating payment status', e)
        return null
    }
}

// export const createPaymentFromStripeSchedule = async (stripeSchedule: Stripe.SubscriptionSchedule) => {
//     let paymentData: Partial<Payment> | null = {};
//     const priceId = stripeSchedule.phases[0].items[0].price as string || "";
//     const price = await getStripePriceById(priceId);
//     const customer = await getStripeCustomerById(stripeSchedule.customer as string);
//     let dbCustomer = await prisma.contact.findFirst({
//         where: {
//             contactContactInformation: {
//                 email: customer?.deleted ? null : customer?.email
//             }
//         },
//     })

//     if (!dbCustomer) {
//         dbCustomer = await prisma.contact.create({
//             data: {
//                 contactContactInformation: {
//                     create: {
//                         email: customer?.deleted ? null : customer?.email
//                     }
//                 }
//             }
//         })
//     }
//     paymentData.stripeScheduleId = stripeSchedule.id;
//     paymentData.contactId = dbCustomer?.contact?.id;
//     paymentData.frequency = stripeIntervalMap(price?.recurring?.interval || "");

//     paymentData.contactId

//     const interval = 

//     const payment = await prisma.payment.create({
//         data: {
//             stripeScheduleId
//         }
//     });
//     return payment
// }

const stripeIntervalMap = (frequency: string): PaymentFrequencyType => {
    switch (frequency) {
      case "day":
        return "Daily";
      case "week":
        return "Weekly";
      case "month":
        return "Monthly";
      case "year":
        return "Annually";
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

export const updatePaymentFromStripeSchedule = async (stripeSchedule: Stripe.SubscriptionSchedule) => {
    let paymentData: Partial<Payment> | null = {};
    const start_date =new Date(stripeSchedule.phases[0].start_date * 1000) ;
    const anticipatedEndDate = new Date(stripeSchedule.phases[0].end_date * 1000)
    const priceId = stripeSchedule.phases[0].items[0].price as string || "";
    const price = await getStripePriceById(priceId);
    const frequency = stripeIntervalMap(price?.recurring?.interval || "");
    paymentData.frequency = frequency;
    paymentData.anticipatedEndDate = anticipatedEndDate;
    paymentData.startDate = start_date;
    
    // updateMany due to non-unique constraint cause stripeScheduleId is added after payment is created
    const payment = await prisma.payment.updateMany({
        where: {
            stripeScheduleId: stripeSchedule.id
        },
        data: {
            ...paymentData
        }
    });
    return payment
}

export const getInvoicesForPayment = async (paymentId: string) => {
    try {
        const invoices = await prisma.paymentInvoice.findMany({
            where: {
                paymentId
            }
        });
        return invoices
    } catch (e) {
        console.log('Error getting invoices for payment', e)
        return null
    }
}
const formatTableData = (payment: any) => {

    return {
        id: payment.id,
        totalOwed: payment.totalOwed.toNumber(),
        status: payment.status,
        totalPaid: payment.totalPaid.toNumber(),
        totalPayments: payment.totalPayments,
        startDate: payment.startDate,
        anticipatedEndDate: payment.anticipatedEndDate,
        frequency: payment.frequency,
        companyName: payment.contact?.contactContactInformation?.company || "",
        stripeScheduleId: payment.stripeScheduleId || "",
        purchases: payment.purchases || []
    }
}