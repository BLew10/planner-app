"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink } from "lucide-react";
import { DataTable } from "@/app/(components)/general/DataTable";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { PaymentModel } from "@/lib/models/payment";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface PaymentsTableProps {
  payments: Partial<PaymentModel>[] | null;
  isLoading: boolean;
  selectedRows: string[];
  onSelectedRowsChange: (rows: string[]) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: () => void;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  totalItems: number;
  currentPage: number;
  year: string;
  onYearChange: (year: string) => void;
  filterOptions: { value: string; label: string }[];
  onPaymentClick: (paymentOverviewId: string, companyName: string) => void;
}

export function PaymentsTable({
  payments,
  isLoading,
  selectedRows,
  onSelectedRowsChange,
  onDelete,
  onDeleteSelected,
  onSearch,
  onPageChange,
  totalItems,
  currentPage,
  year,
  onYearChange,
  filterOptions,
  onPaymentClick,
}: PaymentsTableProps) {
  const columns: ColumnDef<Partial<PaymentModel>>[] = [
    {
      accessorKey: "companyName",
      header: "Company Name",
      cell: ({ row }) => {
        const payment = row.original;
        const companyName = payment.contact?.contactContactInformation?.company || "Unknown";
        return (
          <div className="flex items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal text-left"
                  onClick={() => onPaymentClick(payment.paymentOverviewId || "", companyName)}
                >
                  {companyName}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-1"
                  onClick={() => onPaymentClick(payment.paymentOverviewId || "", companyName)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
              {payment.contact?.contactContactInformation?.firstName && (
                <p className="text-muted-foreground text-sm">
                  {payment.contact?.contactContactInformation?.firstName}{" "}
                  {payment.contact?.contactContactInformation?.lastName}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.original.amount?.toString() || "0");
        return <div>{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "paymentDate",
      header: "Payment Date",
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }) => {
        const method = row.original.paymentMethod;
        return <Badge variant="outline">{method}</Badge>;
      },
    },
    {
      accessorKey: "checkNumber",
      header: "Check Number",
      cell: ({ row }) => {
        const checkNumber = row.original.checkNumber;
        return checkNumber ? checkNumber : "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payment = row.original;
        const wasPrepaid = payment.wasPrepaid;
        
        if (wasPrepaid) {
          return (
            <Badge variant="secondary">PREPAYMENT</Badge>
          );
        }
        
        return (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/payments/${payment.id}?purchaseId=${payment.purchaseId}&paymentOverviewId=${payment.paymentOverviewId}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteButton
              itemType="Payment"
              itemName={`${payment.contact?.contactContactInformation?.company || "Unknown"}'s payment`}
              onDelete={() => onDelete(payment.id || "")}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={payments || []}
      isLoading={isLoading}
      title="Payments"
      filterOptions={filterOptions}
      defaultFilterValue={year}
      onFilterChange={onYearChange}
      onSearch={onSearch}
      onPageChange={onPageChange}
      selectedRows={selectedRows}
      onSelectedRowsChange={onSelectedRowsChange}
      onDeleteSelected={onDeleteSelected}
      currentPage={currentPage}
      searchPlaceholder="Search payments..."
      totalItems={totalItems}
    />
  );
} 