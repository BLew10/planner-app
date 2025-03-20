"use client";
import React, { useState, useEffect, useMemo } from "react";
import { getOwedPayments } from "@/lib/data/paymentOverview";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import InvoiceSending from "./InvoiceSending";
import { ScheduledPayment } from "@prisma/client";
import PaymentScheduleModal from "./PaymentScheduleModal";
import { ALL_YEARS, INVOICE_TYPES, InvoiceType } from "@/lib/constants";
import { Row } from "@tanstack/react-table";

// shadcn components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Info, Calendar, Mail, MousePointer, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEFAULT_YEAR } from "@/lib/constants";
import { DataTable } from "@/app/(components)/general/DataTable";

// Constants
const ITEMS_PER_PAGE = 10;

// Helper function to get the next payment date
const getNextPaymentDate = (scheduledPayments: ScheduledPayment[] | null) => {
  if (!scheduledPayments || scheduledPayments.length === 0) {
    return { dueDate: "", isLate: false };
  }

  // Sort the unpaid payments by due date
  const unpaidPayments = scheduledPayments
    .filter((payment) => !payment.isPaid)
    .sort((a, b) => {
      // Convert string dates to Date objects for proper comparison
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  if (unpaidPayments.length === 0) {
    return { dueDate: "", isLate: false };
  }

  // Return the earliest unpaid payment
  return {
    dueDate: unpaidPayments[0].dueDate,
    isLate: unpaidPayments[0].isLate,
  };
};

// Format date to M-D-YY
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const month = date.getMonth() + 1; // getMonth() is 0-based
  const day = date.getDate();
  const year = date.getFullYear().toString().substr(-2); // Get last 2 digits
  return `${month}-${day}-${year}`;
};

const BillingPage = () => {
  const [owedPayments, setOwedPayments] = useState<
    Partial<PaymentOverviewModel>[] | null
  >(null);
  const [payment, setPayment] = useState<Partial<PaymentOverviewModel> | null>(
    null
  );
  const [step, setStep] = useState(1);
  const [selectedPayments, setSelectedPayments] = useState<
    Partial<PaymentOverviewModel>[]
  >([]);
  const [invoiceType, setInvoiceType] =
    useState<InvoiceType>("invoiceTotalSale");
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [selectAll, setSelectAll] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openPaymentScheduleModal, setOpenPaymentScheduleModal] =
    useState(false);
  const [activeTab, setActiveTab] = useState("all-payments");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Separate pagination states for each tab
  const [allPaymentsPage, setAllPaymentsPage] = useState(1);
  const [thisMonthPage, setThisMonthPage] = useState(1);

  // Get current page based on active tab
  const currentPage =
    activeTab === "all-payments" ? allPaymentsPage : thisMonthPage;
  const setCurrentPage = (page: number) => {
    if (activeTab === "all-payments") {
      setAllPaymentsPage(page);
    } else {
      setThisMonthPage(page);
    }
  };

  const onPaymentClick = (paymentId: string) => {
    setPayment(owedPayments?.find((p) => p.id === paymentId) || null);
    setOpenPaymentScheduleModal(true);
  };

  useEffect(() => {
    const fetchPayments = async (year: string) => {
      setIsLoading(true);
      const payments = await getOwedPayments(year, searchQuery);
      setOwedPayments(payments);
      setSelectedPayments([]);
      setSelectAll(false);
      setCurrentPage(1);
      setIsLoading(false);
    };
    fetchPayments(year);
  }, [year, searchQuery]);

  const handleSelectedPayment = (paymentId: string, isChecked: boolean) => {
    if (isChecked) {
      if (selectedPayments?.find((payment) => payment.id === paymentId)) return;
      setSelectedPayments([
        ...(selectedPayments || []),
        owedPayments?.find((payment) => payment.id === paymentId)!,
      ]);
    } else {
      setSelectedPayments(
        selectedPayments.filter((payment) => payment.id !== paymentId)
      );
    }
  };

  const handleInvoiceType = (value: string) => {
    setInvoiceType(value as InvoiceType);
  };

  const handleYearChange = (value: string) => {
    setYear(value);
  };

  const onNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBulkEmailInvoices = () => {
    setOpenModal(true);
  };

  // Filter for payments due this month
  const paymentsThisMonth = useMemo(() => {
    if (!owedPayments) return [];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return owedPayments.filter((payment) => {
      const nextPayment = payment.scheduledPayments?.find((sp) => {
        if (sp.isPaid) return false;
        const dueDate = new Date(sp.dueDate);
        return (
          dueDate.getMonth() === currentMonth &&
          dueDate.getFullYear() === currentYear
        );
      });
      return nextPayment !== undefined;
    });
  }, [owedPayments]);

  // Reset page when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Define column definitions for all payments
  const allPaymentsColumns = [
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

  // Define column definitions for this month payments
  const thisMonthColumns = [
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
      accessorKey: "thisMonthPayment",
      header: "This Month's Due Date",
      cell: ({ row }: { row: Row<Partial<PaymentOverviewModel>> }) => {
        const payment = row.original;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const thisMonthPayment = payment.scheduledPayments?.find((sp) => {
          if (sp.isPaid) return false;
          const dueDate = new Date(sp.dueDate);
          return (
            dueDate.getMonth() === currentMonth &&
            dueDate.getFullYear() === currentYear
          );
        });

        return thisMonthPayment ? (
          <div className="flex items-center gap-2">
            <span
              className={
                thisMonthPayment.isLate ? "text-destructive font-medium" : ""
              }
            >
              {thisMonthPayment.dueDate}
            </span>
            {thisMonthPayment.isLate && (
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

  // Calculate the total number of items for pagination
  const totalItems = useMemo(() => {
    return activeTab === "all-payments"
      ? owedPayments?.length || 0
      : paymentsThisMonth.length;
  }, [owedPayments, paymentsThisMonth, activeTab]);

  return (
    <div className="container mx-auto p-8">
      {/* Invoice Type Selection Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Type Selection</DialogTitle>
            <DialogDescription>
              Choose the type of invoice you want to generate
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="invoiceType">Invoice Type</Label>
            <Select value={invoiceType} onValueChange={handleInvoiceType}>
              <SelectTrigger id="invoiceType">
                <SelectValue placeholder="Select invoice type" />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpenModal(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={() => {
                onNext();
                setOpenModal(false);
              }}
            >
              Generate Invoices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Schedule Modal */}
      <PaymentScheduleModal
        isOpen={openPaymentScheduleModal}
        closeModal={() => setOpenPaymentScheduleModal(false)}
        title={`Payment Schedule for ${payment?.contact?.contactContactInformation?.firstName} ${payment?.contact?.contactContactInformation?.lastName}`}
        paymentId={payment?.id as string}
      />

      {/* Main Content */}
      {step !== 1 && (
        <Button
          variant="outline"
          onClick={() => setStep((prev) => prev - 1)}
          className="mb-4"
        >
          Back
        </Button>
      )}

      {step === 1 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Billing Management</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={year} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_YEARS.map((yearOption) => (
                    <SelectItem key={yearOption.value} value={yearOption.value}>
                      {yearOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedPayments.length > 0 && (
                <Button onClick={() => setOpenModal(true)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Generate Invoices ({selectedPayments.length})
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="all-payments"
                  className="flex items-center gap-2"
                >
                  <Info className="h-4 w-4" />
                  All Payments ({owedPayments?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="this-month"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Due This Month ({paymentsThisMonth.length})
                </TabsTrigger>
              </TabsList>

              {/* Instructions for clickable rows */}
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                <MousePointer className="h-3.5 w-3.5" />
                Click the details icon next to a contact name to view their
                complete payment schedule
              </p>

              <TabsContent value="all-payments" className="space-y-4">
                <DataTable
                  isLoading={isLoading}
                  columns={allPaymentsColumns}
                  data={activeTab === "all-payments" ? owedPayments || [] : []}
                  title={`Payments for ${year}`}
                  searchPlaceholder="Search payments..."
                  onSearch={(value) => setSearchQuery(value)}
                  selectedRows={selectedPayments.map((p) => p.id as string)}
                  onSelectedRowsChange={(rows) => {
                    setSelectedPayments(
                      (owedPayments || []).filter((p) =>
                        rows.includes(p.id as string)
                      )
                    );
                  }}
                  onDeleteSelected={handleBulkEmailInvoices}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={totalItems}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </TabsContent>

              <TabsContent value="this-month" className="space-y-4">
                <DataTable
                  isLoading={isLoading}
                  columns={thisMonthColumns}
                  data={activeTab === "this-month" ? paymentsThisMonth : []}
                  title="Payments Due This Month"
                  searchPlaceholder="Search payments..."
                  onSearch={(value) => setSearchQuery(value)}
                  selectedRows={selectedPayments.map((p) => p.id as string)}
                  onSelectedRowsChange={(rows) => {
                    setSelectedPayments(
                      (owedPayments || []).filter((p) =>
                        rows.includes(p.id as string)
                      )
                    );
                  }}
                  onDeleteSelected={handleBulkEmailInvoices}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={totalItems}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  searchQuery={searchQuery}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <InvoiceSending
          paymentOverviews={selectedPayments} 
          invoiceType={invoiceType}
          onSendInvoices={() => setStep(1)}
        />
      )}
    </div>
  );
};

export default BillingPage;
