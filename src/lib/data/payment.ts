"use server";

import prisma from "@/lib/prisma/prisma";
import { PaymentStatusType } from "../constants";
import { auth } from "@/auth";

export interface PaymentTableData {
    id: string;
    totalOwed: number;
    status: string;
    totalPaid: number;
    totalPayments: number;
    startDate: Date;    
    anticipatedEndDate: Date;
    frequency: string;
    companyName: string;
  }


export const getAllPayments = async (paymentStatus: PaymentStatusType): Promise<PaymentTableData[]> => {
    try {

        const session = await auth();
        const userId = session?.user?.id;
        const payments = await prisma.payment.findMany({
            where: {
                userId,
                status: paymentStatus
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

        const tableData: PaymentTableData[] = payments.map((payment) => {
            return {
                id: payment.id,
                totalOwed: payment.totalOwed.toNumber(),
                status: payment.status,
                totalPaid: payment.totalPaid.toNumber(),
                totalPayments: payment.totalPayments,
                startDate: payment.startDate,
                anticipatedEndDate: payment.anticipatedEndDate,
                frequency: payment.frequency,
                companyName: payment.contact?.contactContactInformation?.company || ""
            }
        })


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
                id
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