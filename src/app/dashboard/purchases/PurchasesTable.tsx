"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink } from "lucide-react";
import { DataTable } from "@/app/(components)/general/DataTable";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { PurchaseTableData } from "@/lib/data/purchase";
import { Badge } from "@/components/ui/badge";

interface PurchasesTableProps {
  purchases: PurchaseTableData[] | null;
  isLoading: boolean;
  selectedRows: string[];
  onSelectedRowsChange: (rows: string[]) => void;
  onDelete: (id: string, paymentOverviewId: string) => void;
  onDeleteSelected: () => void;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  totalItems: number;
  currentPage: number;
  year: string;
  onYearChange: (year: string) => void;
  filterOptions: { value: string; label: string }[];
  onPurchaseClick: (purchaseId: string, companyName: string) => void;
}

export function PurchasesTable({
  purchases,
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
  onPurchaseClick,
}: PurchasesTableProps) {
  const columns: ColumnDef<PurchaseTableData>[] = [
    {
      accessorKey: "companyName",
      header: "Company Name",
      cell: ({ row }) => {
        const purchase = row.original;
        return (
          <div className="flex items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal text-left"
                  onClick={() => onPurchaseClick(purchase.id, purchase.companyName)}
                >
                  {purchase.companyName}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-1"
                  onClick={() => onPurchaseClick(purchase.id, purchase.companyName)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amountOwed",
      header: "Purchase Total",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amountOwed") || "0");
        return <div>${amount.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "total",
      header: "Total with Discounts and Late Fees",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total") || "0");
        return <div>${amount.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "purchasedOn",
      header: "Purchased On",
    },
    {
      accessorKey: "amountPaid",
      header: "Amount Paid",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amountPaid") || "0");
        return <div>${amount.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "calendarEditions",
      header: "Calendar Editions",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const purchase = row.original;
        return (
          <div className="flex items-center gap-2">
            {!purchase.paymentOverviewId ? (
              <Link href={`/dashboard/payment-overview/add?purchaseId=${purchase.id}`}>
                <Button variant="outline" size="sm">
                  Add Payment Plan
                </Button>
              </Link>
            ) : (
              <Link href={`/dashboard/payments/add?purchaseId=${purchase.id}&paymentOverviewId=${purchase.paymentOverviewId}`}>
                <Button variant="outline" size="sm">
                  Make Payment
                </Button>
              </Link>
            )}
            <Link href={`/dashboard/purchases/${purchase.id}?contactId=${purchase.contactId}&year=${purchase.calendarEditionYear}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteButton
              itemType="Purchase"
              itemName={`${purchase.companyName}'s purchase for ${purchase.calendarEditionYear}`}
              onDelete={() => onDelete(purchase.id, purchase.paymentOverviewId || "")}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={purchases || []}
      isLoading={isLoading}
      title="Purchases"
      filterOptions={filterOptions}
      defaultFilterValue={year}
      onFilterChange={onYearChange}
      onSearch={onSearch}
      onPageChange={onPageChange}
      selectedRows={selectedRows}
      onSelectedRowsChange={onSelectedRowsChange}
      onDeleteSelected={onDeleteSelected}
      currentPage={currentPage}
      searchPlaceholder="Search purchases..."
      totalItems={totalItems}
    />
  );
} 