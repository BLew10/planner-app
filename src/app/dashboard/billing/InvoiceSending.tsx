import React, { useState } from "react";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { generateInvoiceTotalStatementPdf } from "./InvoiceTotalStatement";
import { generateStatementPdf, getNextPayment } from "./Statement";
import InvoiceTotalStatement from "./InvoiceTotalStatement";
import Statement from "./Statement";
import { useToast } from "@/hooks/shadcn/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvoiceSendingProps {
  paymentOverviews: Partial<PaymentOverviewModel>[] | null;
  invoiceType: string;
  onSendInvoices: () => void;
}

export default function InvoiceSending({
  paymentOverviews,
  invoiceType,
  onSendInvoices,
}: InvoiceSendingProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSendInvoice = (id: string, checked: boolean) => {
    if (checked) {
      if (checkedIds.includes(id)) return;
      setCheckedIds((prev) => [...prev, id]);
    } else {
      setCheckedIds((prev) => prev.filter((existingId) => existingId !== id));
    }
  };

  const sendInvoices = async () => {
    if (checkedIds.length === 0) {
      toast({
        title: "No payments selected",
        variant: "destructive",
      });
      return;
    }
    for (const id of checkedIds) {
      const paymentOverview = paymentOverviews?.find((po) => po.id === id);
      if (paymentOverview) {
        const customerEmail =
          paymentOverview.contact?.contactTelecomInformation?.email || null;
        if (!customerEmail) return;
        await generateAndSendPdf(paymentOverview, customerEmail);
      }
    }
    toast({
      title: "Invoices sent",
      variant: "default",
    });
    onSendInvoices();
  };

  const generateAndSendPdf = async (
    paymentOverview: Partial<PaymentOverviewModel>,
    customerEmail: string | null
  ) => {
    try {
      let pdfBlob: Blob = new Blob();
      if (invoiceType === "statement") {
        pdfBlob = await generateStatementPdf(paymentOverview);
      } else {
        pdfBlob = await generateInvoiceTotalStatementPdf(paymentOverview);
      }

      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onloadend = async function () {
        const base64data = reader.result;

        const nextPayment = getNextPayment(paymentOverview, true);
        await fetch("/api/sendEmail", {
          method: "POST",
          body: JSON.stringify({
            attachment: {
              ContentType: "application/pdf",
              Filename: `Invoice-${paymentOverview.calendarEditionYear}.pdf`,
              Base64Content: base64data?.toString().split("base64,")[1],
            },
            to: customerEmail,
            subject: `Invoice for Calendar ${paymentOverview.calendarEditionYear}`,
            text: `Next Payment: ${nextPayment.dueDate} ${nextPayment.amount}`,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      };
    } catch (error) {
      toast({
        title: "Error sending invoices",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Sending</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={checkedIds.length === (paymentOverviews?.length || 0)}
                    onCheckedChange={(value) => {
                      const newCheckedIds = value
                        ? paymentOverviews?.map((po) => po.id || "") || []
                        : [];
                      setCheckedIds(newCheckedIds);
                    }}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentOverviews?.map((paymentOverview) => (
                <TableRow key={paymentOverview.id}>
                  <TableCell>
                    <Checkbox
                      checked={checkedIds.includes(paymentOverview.id || "")}
                      onCheckedChange={(value) => 
                        handleSendInvoice(paymentOverview.id || "", !!value)
                      }
                      aria-label="Select row"
                    />
                  </TableCell>
                  <TableCell>
                    {paymentOverview.contact?.contactContactInformation?.company}
                  </TableCell>
                  <TableCell>
                    {paymentOverview.contact?.contactContactInformation?.firstName}{" "}
                    {paymentOverview.contact?.contactContactInformation?.lastName}
                  </TableCell>
                  <TableCell>{paymentOverview.calendarEditionYear}</TableCell>
                  <TableCell>
                    {invoiceType === "invoiceTotalSale" && (
                      <InvoiceTotalStatement paymentOverview={paymentOverview} />
                    )}
                    {invoiceType === "statements" && (
                      <Statement paymentOverview={paymentOverview} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={sendInvoices}
            disabled={checkedIds.length === 0}
          >
            Send Selected ({checkedIds.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
