import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPaymentOverviewById } from "@/lib/data/paymentOverview";
import LoadingSpinner from "@/app/(components)/general/LoadingSpinner";
import { ScheduledPayment } from "@prisma/client";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { PaymentModel } from "@/lib/models/payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentScheduleModalProps {
  isOpen: boolean;
  closeModal: () => void;
  title?: string;
  paymentId: string;
}

export default function PaymentScheduleModal({
  isOpen,
  closeModal,
  title,
  paymentId,
}: PaymentScheduleModalProps) {
  const [paymentOverview, setPaymentOverviewData] =
    useState<Partial<PaymentOverviewModel> | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [scheduledPayments, setScheduledPayments] = useState<
    ScheduledPayment[] | null
  >(null);
  const [paymentsMade, setPaymentsMade] = useState<
    Partial<PaymentModel>[] | null
  >(null);

  const sortByDateScheduledPayments = (payments: ScheduledPayment[] | null) => {
    if (payments) {
      return payments.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
    }
    return [];
  };

  const sortByDatePaymentsMade = (payments: Partial<PaymentModel>[] | null) => {
    if (payments) {
      return payments.sort((a, b) => {
        if (a.paymentDate && b.paymentDate) {
          return (
            new Date(a.paymentDate).getTime() -
            new Date(b.paymentDate).getTime()
          );
        }
        return 0;
      });
    }
    return [];
  };
  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      const data = await getPaymentOverviewById(paymentId);
      setPaymentOverviewData(data || null);
      if (data) {
        setScheduledPayments(
          sortByDateScheduledPayments(
            paymentOverview?.scheduledPayments || null
          )
        );
        setPaymentsMade(
          sortByDatePaymentsMade(paymentOverview?.payments || null)
        );
      }
      setIsFetching(false);
    };
    fetchData();
  }, [paymentId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[650px]">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}

        {isFetching ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentOverview?.scheduledPayments &&
                paymentOverview?.scheduledPayments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount Owed</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Amount Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortByDateScheduledPayments(
                        paymentOverview?.scheduledPayments || null
                      ).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.dueDate}</TableCell>
                          <TableCell>
                            ${Number(payment.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>{payment.paymentDate}</TableCell>
                          <TableCell>
                            ${Number(payment.amountPaid).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-3 text-muted-foreground">
                    No Payment Schedule found
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentOverview?.payments &&
                paymentOverview?.payments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Check Number</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortByDatePaymentsMade(
                        paymentOverview?.payments || null
                      ).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.paymentDate}</TableCell>
                          <TableCell>
                            {payment.paymentMethod || "Deposit"}{" "}
                            {payment.wasPrepaid && "- Prepayment"}
                          </TableCell>
                          <TableCell>{payment.checkNumber}</TableCell>
                          <TableCell>
                            ${Number(payment.amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-3 text-muted-foreground">
                    No Payments have been made
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button onClick={closeModal}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
