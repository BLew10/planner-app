import React from "react";
import { Row } from "@tanstack/react-table";
import { DataTable } from "@/app/(components)/general/DataTable";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { ScheduledPayment } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, ExternalLink } from "lucide-react";

// Helper functions
import { formatDate } from "../(utils)/formatHelpers";
import { getNextPaymentDate } from "../(utils)/paymentHelpers";
import CalendarYearSelector from "./CalendarYearSelector";

interface AllPaymentsTabProps {
  owedPayments: Partial<PaymentOverviewModel>[] | null;
  isLoading: boolean;
  searchQuery: string;
  onSearch: (value: string) => void;
  selectedPayments: Partial<PaymentOverviewModel>[];
  onSelectedRowsChange: (rows: string[]) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  year: string;
  onPaymentClick: (paymentId: string) => void;
  selectedCalendarYear: string;
  onCalendarYearChange: (value: string) => void;
}

const AllPaymentsTab: React.FC<AllPaymentsTabProps> = ({
  owedPayments,
  isLoading,
  onSearch,
  selectedPayments,
  onSelectedRowsChange,
  currentPage,
  onPageChange,
  totalItems,
  onPaymentClick,
  selectedCalendarYear,
  onCalendarYearChange,
}) => {

  const columns = [
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }: { row: Row<Partial<PaymentOverviewModel>> }) => {
        const payment = row.original;
        return (
          <div className="flex items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {payment.contact?.contactContactInformation?.firstName}{" "}
                  {payment.contact?.contactContactInformation?.lastName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-1"
                  onClick={() => onPaymentClick(payment.id as string)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
              {payment.contact?.contactContactInformation?.company && (
                <p className="text-muted-foreground text-sm">
                  {payment.contact?.contactContactInformation?.company}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: { row: Row<Partial<PaymentOverviewModel>> }) => {
        const payment = row.original;
        return payment.contact?.contactTelecomInformation?.email ? (
          <span className="text-sm">
            {payment.contact?.contactTelecomInformation?.email}
          </span>
        ) : (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>No Email</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "calendarYear",
      header: "Calendar Year",
      cell: ({ row }: { row: Row<Partial<PaymentOverviewModel>> }) => {
        const payment = row.original;
        return payment.purchase?.calendarEditionYear || "-";
      },
    },
    {
      accessorKey: "nextPaymentDue",
      header: "Next Payment Due",
      cell: ({ row }: { row: Row<Partial<PaymentOverviewModel>> }) => {
        const payment = row.original;
        const nextPaymentDate = getNextPaymentDate(
          payment.scheduledPayments as ScheduledPayment[]
        );

        return nextPaymentDate.dueDate ? (
          <div className="flex items-center gap-2">
            <span
              className={
                nextPaymentDate.isLate ? "text-destructive font-medium" : ""
              }
            >
              {nextPaymentDate.dueDate}
            </span>
            {nextPaymentDate.isLate && (
              <Badge variant="destructive" className="text-xs">
                Late
              </Badge>
            )}
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "purchasedOn",
      header: "Purchased On",
      cell: ({ row }: { row: Row<Partial<PaymentOverviewModel>> }) => {
        const payment = row.original;
        return formatDate(payment.purchase?.createdAt);
      },
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }: { row: Row<Partial<PaymentOverviewModel>> }) => {
        const payment = row.original;
        const balance =
          Number(payment.net || 0) - Number(payment.amountPaid || 0);
        return <span className="font-medium">${balance.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: "invoiceNumber",
      header: "Invoice Number",
      cell: ({ row }: { row: Row<Partial<PaymentOverviewModel>> }) => {
        const payment = row.original;
        return payment.invoiceNumber || "-";
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CalendarYearSelector
          selectedYear={selectedCalendarYear}
          onYearChange={onCalendarYearChange}
        />
      </div>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={owedPayments || []}
        title={`Payments for ${selectedCalendarYear === "all" ? "All Years" : selectedCalendarYear}`}
        searchPlaceholder="Search payments..."
        onSearch={onSearch}
        selectedRows={selectedPayments.map((p) => p.id as string)}
        onSelectedRowsChange={onSelectedRowsChange}
        totalItems={totalItems}
        currentPage={currentPage}
        onPageChange={onPageChange}
        noPagination={true}
      />
    </div>
  );
};

export default AllPaymentsTab; 