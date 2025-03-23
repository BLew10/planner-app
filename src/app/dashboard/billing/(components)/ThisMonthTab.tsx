"use client";
import React, { useState, useEffect } from "react";
import { DataTable } from "@/app/(components)/general/DataTable";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatDate } from "../(utils)/formatHelpers";
import CalendarYearSelector from "./CalendarYearSelector";
import { getThisMonthPayments } from "@/lib/data/paymentOverview";
import PaymentScheduleModal from "../PaymentScheduleModal";
import { getNextPaymentDate } from "@/utils/paymentHelpers";
interface ThisMonthTabProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedCalendarYear: string;
  onCalendarYearChange: (year: string) => void;
  onSelectionChange: (
    selectedPayments: Partial<PaymentOverviewModel>[]
  ) => void;
}

const ThisMonthTab: React.FC<ThisMonthTabProps> = ({
  searchQuery,
  onSearch,
  selectedCalendarYear,
  onCalendarYearChange,
  onSelectionChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<Partial<PaymentOverviewModel>[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);

  // Add modal state and selected payment
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<Partial<PaymentOverviewModel> | null>(null);

  // Handle payment click to open the modal
  const handlePaymentClick = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      setSelectedPayment(payment);
      setIsModalOpen(true);
    }
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCalendarYear, searchQuery]);

  // Fetch data only when filters or pagination changes
  useEffect(() => {
    let isMounted = true;

    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const { data, totalItems: total } = await getThisMonthPayments(
          selectedCalendarYear,
          searchQuery,
          page,
          itemsPerPage
        );

        if (!isMounted) return;

        setPayments(data || []);
        setTotalItems(total);
      } catch (error) {
        console.error("Error fetching this month's payments:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPayments();

    return () => {
      isMounted = false;
    };
  }, [selectedCalendarYear, searchQuery, page, itemsPerPage]);

  // Simple handler for row selection
  const handleRowSelectionChange = (newSelectedIds: string[]) => {
    setSelectedPaymentIds(newSelectedIds);

    // Map IDs to payment objects
    const selectedItems = payments
      .filter((payment) => payment.id && newSelectedIds.includes(payment.id))
      .map((payment) => payment);

    // Notify parent
    onSelectionChange(selectedItems);
  };

  const columns = [
    {
      accessorKey: "contact.contactContactInformation.company",
      header: "Company",
      cell: ({ row }: any) => {
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
                  onClick={() => handlePaymentClick(payment.id as string)}
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
      accessorKey: "purchase.year",
      header: "Calendar Edition Year",
      cell: ({ row }: any) => row.original.purchase?.year || "-",
    },
    {
      accessorKey: "net",
      header: "Amount",
      cell: ({ row }: any) => {
        const nextPayment = getNextPaymentDate(row.original.scheduledPayments);
        const scheduledPayment = row.original.scheduledPayments?.find(
          (payment: any) => payment.dueDate === nextPayment.dueDate
        );
        const amount = Number(scheduledPayment?.amount || 0);
        return `$${amount.toFixed(2)}`;
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }: any) => {
        const nextPayment = getNextPaymentDate(row.original.scheduledPayments);
        return formatDate(nextPayment?.dueDate || "");
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const nextPayment = getNextPaymentDate(row.original.scheduledPayments);
        if (nextPayment?.isLate) {
          return <span className="text-red-500 font-semibold">Late</span>;
        }
        
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const dueDate = new Date(nextPayment?.dueDate || "");
        const paymentMonth = dueDate.getMonth() + 1;
        const paymentYear = dueDate.getFullYear();
        
        if (paymentYear < currentYear || 
            (paymentYear === currentYear && paymentMonth < currentMonth)) {
          return <span className="text-amber-600">Overdue</span>;
        }
        
        return <span className="text-yellow-500">Pending</span>;
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
        data={payments}
        title="Current & Overdue Payments"
        searchPlaceholder="Search payments..."
        onSearch={onSearch}
        selectedRows={selectedPaymentIds}
        onSelectedRowsChange={handleRowSelectionChange}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        currentPage={page}
        onPageChange={setPage}
        searchQuery={searchQuery}
      />

      {/* Payment Schedule Modal */}
      <PaymentScheduleModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        title={
          selectedPayment
            ? `Payment Schedule for ${selectedPayment.contact?.contactContactInformation?.firstName} ${selectedPayment.contact?.contactContactInformation?.lastName}`
            : "Payment Schedule"
        }
        paymentId={selectedPayment?.id as string}
      />
    </div>
  );
};

export default ThisMonthTab;
