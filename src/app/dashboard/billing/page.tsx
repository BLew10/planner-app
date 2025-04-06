"use client";
import React, { useState, useEffect, useMemo } from "react";
import { getOwedPayments } from "@/lib/data/paymentOverview";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import InvoiceSending from "./InvoiceSending";
import PaymentScheduleModal from "./PaymentScheduleModal";
import { INVOICE_TYPES, InvoiceType, DEFAULT_YEAR } from "@/lib/constants";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Calendar, Mail, MousePointer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CashFlowReportTab from "./(components)/CashFlowReportTab";
import AllPaymentsTab from "./(components)/AllPaymentsTab";
import ThisMonthTab from "./(components)/ThisMonthTab";
import CalendarYearSelector from "./(components)/CalendarYearSelector";

// const getNextPaymentDate = (scheduledPayments: ScheduledPayment[] | null) => {
//   if (!scheduledPayments || scheduledPayments.length === 0) {
//     return { dueDate: "", isLate: false };
//   }

//   // Sort the unpaid payments by due date
//   const unpaidPayments = scheduledPayments
//     .filter((payment) => !payment.isPaid)
//     .sort((a, b) => {
//       // Convert string dates to Date objects for proper comparison
//       return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
//     });

//   if (unpaidPayments.length === 0) {
//     return { dueDate: "", isLate: false };
//   }

//   // Return the earliest unpaid payment
//   return {
//     dueDate: unpaidPayments[0].dueDate,
//     isLate: unpaidPayments[0].isLate,
//   };
// };

// // Format date to M-D-YY
// const formatDate = (dateString: string | Date | null | undefined): string => {
//   if (!dateString) return "-";

//   const date = new Date(dateString);
//   const month = date.getMonth() + 1; // getMonth() is 0-based
//   const day = date.getDate();
//   const year = date.getFullYear().toString();
//   return `${month}-${day}-${year}`;
// };

const ITEMS_PER_PAGE = 5;

const BillingPage = () => {
  const [owedPayments, setOwedPayments] = useState<
    Partial<PaymentOverviewModel>[] | null
  >(null);
  const [totalItems, setTotalItems] = useState(0);
  const [payment, setPayment] = useState<Partial<PaymentOverviewModel> | null>(
    null
  );
  const [step, setStep] = useState(1);
  const [selectedPayments, setSelectedPayments] = useState<
    Partial<PaymentOverviewModel>[]
  >([]);
  const [invoiceType, setInvoiceType] =
    useState<InvoiceType>("invoiceTotalSale");
  const [openModal, setOpenModal] = useState(false);
  const [openPaymentScheduleModal, setOpenPaymentScheduleModal] =
    useState(false);
  const [activeTab, setActiveTab] = useState("all-payments");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCalendarYear, setSelectedCalendarYear] =
    useState(DEFAULT_YEAR);

  // Separate pagination states for each tab
  const [allPaymentsPage, setAllPaymentsPage] = useState(1);
  const [thisMonthPage, setThisMonthPage] = useState(1);

  const onPaymentClick = (paymentId: string) => {
    setPayment(owedPayments?.find((p) => p.id === paymentId) || null);
    setOpenPaymentScheduleModal(true);
  };

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);

      // Current page calculation based on active tab
      const currentPageNum =
        activeTab === "all-payments" ? allPaymentsPage : thisMonthPage;

      // Now pass pagination parameters to the API
      const { data, totalItems: total } = await getOwedPayments(
        selectedCalendarYear,
        searchQuery,
        currentPageNum,
        ITEMS_PER_PAGE
      );

      setOwedPayments(data);
      setSelectedPayments([]);
      setIsLoading(false);
      setTotalItems(total);
    };

    fetchPayments();
  }, [
    selectedCalendarYear,
    searchQuery,
    activeTab,
    allPaymentsPage,
    thisMonthPage,
  ]);

  const handleInvoiceType = (value: string) => {
    setInvoiceType(value as InvoiceType);
  };

  const onNext = () => {
    setStep((prev) => prev + 1);
  };

  // Add this effect to reset pagination when tab changes
  useEffect(() => {
    if (activeTab === "all-payments") {
      setThisMonthPage(1);
    } else {
      setAllPaymentsPage(1);
    }
  }, [activeTab]);

  // Handle tab change to automatically select a year for cash flow report
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // If switching to cash flow report and "all" is selected, auto-select the default year
    if (value === "cash-flow" && selectedCalendarYear === "all") {
      setSelectedCalendarYear(DEFAULT_YEAR);
    }
  };

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
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-4">
              <CardTitle>Billing Management</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <CalendarYearSelector
                selectedYear={selectedCalendarYear}
                onYearChange={setSelectedCalendarYear}
                hideAllYears={activeTab === "cash-flow"}
              />
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
              defaultValue="all-payments"
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                <TabsTrigger
                  value="all-payments"
                  className="flex items-center gap-2 w-full"
                >
                  <Mail className="h-4 w-4" />
                  All Payments
                </TabsTrigger>
                <TabsTrigger
                  value="this-month"
                  className="flex items-center gap-2 w-full"
                >
                  <Calendar className="h-4 w-4" />
                  Due This Month
                </TabsTrigger>
                <TabsTrigger
                  value="cash-flow"
                  className="flex items-center gap-2 w-full"
                >
                  <Info className="h-4 w-4" />
                  Cash Flow Report
                </TabsTrigger>
              </TabsList>

              {/* Instructions for clickable rows - only show for payment-related tabs */}
              {activeTab !== "cash-flow" && (
                <p className="text-sm text-muted-foreground flex items-center gap-2 my-4">
                  <MousePointer className="h-3.5 w-3.5" />
                  Click the details icon next to a contact name to view their
                  complete payment schedule
                </p>
              )}

              <TabsContent value="all-payments" className="space-y-4">
                <AllPaymentsTab
                  owedPayments={owedPayments}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  onSearch={(value) => setSearchQuery(value)}
                  selectedPayments={selectedPayments}
                  onSelectedRowsChange={(rows) => {
                    setSelectedPayments(
                      (owedPayments || []).filter((p) =>
                        rows.includes(p.id as string)
                      )
                    );
                  }}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={totalItems}
                  currentPage={allPaymentsPage}
                  onPageChange={setAllPaymentsPage}
                  onPaymentClick={onPaymentClick}
                  year={selectedCalendarYear}
                />
              </TabsContent>

              <TabsContent value="this-month" className="space-y-4">
                <ThisMonthTab
                  searchQuery={searchQuery}
                  onSearch={(value) => setSearchQuery(value)}
                  selectedCalendarYear={selectedCalendarYear}
                  onCalendarYearChange={setSelectedCalendarYear}
                  onSelectionChange={(newSelectedPayments) => {
                    setSelectedPayments(newSelectedPayments);
                  }}
                />
              </TabsContent>

              <TabsContent value="cash-flow" className="space-y-4">
                <CashFlowReportTab
                  selectedCalendarYear={selectedCalendarYear}
                  onCalendarYearChange={setSelectedCalendarYear}
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
