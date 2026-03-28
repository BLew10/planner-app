"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, Edit, ExternalLink } from "lucide-react";
import { DataTable } from "@/app/(components)/general/DataTable";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { PurchaseTableData } from "@/lib/data/purchase";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ARTWORK_FILTER_OPTIONS = [
  { value: "all", label: "All Artwork Status" },
  { value: "true", label: "Artwork Submitted" },
  { value: "false", label: "Artwork Not Submitted" },
];

interface PurchasesTableProps {
  purchases: PurchaseTableData[] | null;
  isLoading: boolean;
  selectedRows: string[];
  onSelectedRowsChange: (rows: string[]) => void;
  onDelete: (id: string, paymentOverviewId: string) => void;
  onDeleteSelected: () => void;
  onSearch: (query: string) => void;
  totalItems: number;
  year: string;
  onYearChange: (year: string) => void;
  filterOptions: { value: string; label: string }[];
  onPurchaseClick: (purchaseId: string, companyName: string) => void;
  onToggleArtwork: (purchaseId: string, value: boolean) => void;
  pendingArtworkIds: Set<string>;
  artworkFilter: string;
  onArtworkFilterChange: (value: string) => void;
}

export function PurchasesTable({
  purchases,
  isLoading,
  selectedRows,
  onSelectedRowsChange,
  onDelete,
  onDeleteSelected,
  onSearch,
  totalItems,
  year,
  onYearChange,
  filterOptions,
  onPurchaseClick,
  onToggleArtwork,
  pendingArtworkIds,
  artworkFilter,
  onArtworkFilterChange,
}: PurchasesTableProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingTogglePurchaseId, setPendingTogglePurchaseId] = useState<string | null>(null);

  const handleArtworkToggle = (purchaseId: string, currentValue: boolean) => {
    if (currentValue) {
      setPendingTogglePurchaseId(purchaseId);
      setConfirmDialogOpen(true);
    } else {
      onToggleArtwork(purchaseId, true);
    }
  };

  const handleConfirmToggleOff = () => {
    if (pendingTogglePurchaseId) {
      onToggleArtwork(pendingTogglePurchaseId, false);
    }
    setConfirmDialogOpen(false);
    setPendingTogglePurchaseId(null);
  };

  const columns: ColumnDef<PurchaseTableData>[] = [
    {
      accessorKey: "companyName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Company Name
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      ),
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Calendar Editions
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      ),
    },
    {
      accessorKey: "hasSubmittedArtwork",
      header: "Artwork Submitted",
      cell: ({ row }) => {
        const purchase = row.original;
        const isPending = pendingArtworkIds.has(purchase.id);
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={purchase.hasSubmittedArtwork}
              disabled={isPending}
              className={isPending ? "opacity-50" : ""}
              onCheckedChange={() =>
                handleArtworkToggle(purchase.id, purchase.hasSubmittedArtwork)
              }
            />
          </div>
        );
      },
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
    <>
      <DataTable
        columns={columns}
        data={purchases || []}
        isLoading={isLoading}
        title="Purchases"
        filterOptions={filterOptions}
        defaultFilterValue={year}
        onFilterChange={onYearChange}
        secondFilterOptions={ARTWORK_FILTER_OPTIONS}
        defaultSecondFilterValue={artworkFilter}
        onSecondFilterChange={onArtworkFilterChange}
        secondFilterPlaceholder="Artwork Status"
        onSearch={onSearch}
        selectedRows={selectedRows}
        onSelectedRowsChange={onSelectedRowsChange}
        onDeleteSelected={onDeleteSelected}
        searchPlaceholder="Search purchases..."
        totalItems={totalItems}
        noPagination
        initialSorting={[{ id: "companyName", desc: false }]}
      />

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Artwork Submission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this artwork as not submitted? This
              will change the artwork status back to pending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setPendingTogglePurchaseId(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggleOff}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 