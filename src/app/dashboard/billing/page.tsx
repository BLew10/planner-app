"use client";
import React, { useState, useEffect, useMemo } from "react";
import { getOwedPayments } from "@/lib/data/paymentOverview";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import InvoiceSending from "./InvoiceSending";
import { ScheduledPayment } from "@prisma/client";
import PaymentScheduleModal from "./PaymentScheduleModal";
import { ALL_YEARS, INVOICE_TYPES, InvoiceType } from "@/lib/constants";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Info, Calendar, Mail } from "lucide-react";

const getNextPaymentDate = (scheduledPayments: ScheduledPayment[] | null) => {
  if (scheduledPayments) {
    for (const scheduledPayment of scheduledPayments || []) {
      if (!scheduledPayment.isPaid)
        return {
          dueDate: scheduledPayment.dueDate,
          isLate: scheduledPayment.isLate,
        };
    }
  }
  return { dueDate: "", isLate: false };
};

const ITEMS_PER_PAGE = 10;

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
  const [year, setYear] = useState(ALL_YEARS[0].value);
  const [selectAll, setSelectAll] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openPaymentScheduleModal, setOpenPaymentScheduleModal] =
    useState(false);
  const [activeTab, setActiveTab] = useState("all-payments");

  // Separate pagination states for each tab
  const [allPaymentsPage, setAllPaymentsPage] = useState(1);
  const [thisMonthPage, setThisMonthPage] = useState(1);

  // Get current page based on active tab
  const currentPage = activeTab === "all-payments" ? allPaymentsPage : thisMonthPage;
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
      const payments = await getOwedPayments(year);
      setOwedPayments(payments);
      setSelectedPayments([]);
      setSelectAll(false);
      setCurrentPage(1);
    };
    fetchPayments(year);
  }, [year]);

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

  const toggleAllCheckboxes = () => {
    const toggledSelectAll = !selectAll;
    if (toggledSelectAll) {
      const paymentsWithEmail = owedPayments?.filter(
        (payment) => payment.contact?.contactTelecomInformation?.email
      );
      setSelectedPayments(paymentsWithEmail || []);
    } else {
      setSelectedPayments([]);
    }
    setSelectAll(toggledSelectAll);
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
        return dueDate.getMonth() === currentMonth && 
               dueDate.getFullYear() === currentYear;
      });
      return nextPayment !== undefined;
    });
  }, [owedPayments]);

  // Reset page when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Pagination logic
  const totalPages = useMemo(() => {
    const total =
      activeTab === "all-payments"
        ? Math.ceil((owedPayments?.length || 0) / ITEMS_PER_PAGE)
        : Math.ceil(paymentsThisMonth.length / ITEMS_PER_PAGE);
    return Math.max(1, total);
  }, [owedPayments, paymentsThisMonth, activeTab]);

  const paginatedPayments = useMemo(() => {
    const data = activeTab === "all-payments" ? owedPayments : paymentsThisMonth;
    if (!data) return [];

    const page = activeTab === "all-payments" ? allPaymentsPage : thisMonthPage;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [owedPayments, paymentsThisMonth, allPaymentsPage, thisMonthPage, activeTab]);

  // Generate pagination items
  const paginationItems = useMemo(() => {
    let items = [];
    const maxDisplayedPages = 5;

    if (totalPages <= maxDisplayedPages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Show first, last, current and adjacent pages
      items.push(1);

      if (currentPage > 3) {
        items.push("ellipsis");
      }

      // Pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      if (currentPage < totalPages - 2) {
        items.push("ellipsis");
      }

      items.push(totalPages);
    }

    return items;
  }, [currentPage, totalPages]);

  const renderPaymentRow = (payment: Partial<PaymentOverviewModel>) => {
    const balance = Number(payment.net || 0) - Number(payment.amountPaid || 0);
    const nextPaymentDate = getNextPaymentDate(
      payment.scheduledPayments as ScheduledPayment[]
    );

    return (
      <TableRow key={payment.id}>
        <TableCell>
          <div className="flex items-start gap-2">
            {payment.contact?.contactTelecomInformation?.email ? (
              <>
                <Checkbox
                  id={`payment-${payment.id}`}
                  checked={selectedPayments?.some((p) => p.id === payment.id)}
                  onCheckedChange={(checked) =>
                    handleSelectedPayment(
                      payment.id as string,
                      checked === true
                    )
                  }
                />
                <div
                  className="cursor-pointer"
                  onClick={() => onPaymentClick(payment.id as string)}
                >
                  <p className="font-medium">
                    {payment.contact?.contactContactInformation?.firstName}{" "}
                    {payment.contact?.contactContactInformation?.lastName}
                  </p>
                  {payment.contact?.contactContactInformation?.company && (
                    <p className="text-muted-foreground text-sm">
                      {payment.contact?.contactContactInformation?.company}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => onPaymentClick(payment.id as string)}
              >
                <p className="font-medium">
                  {payment.contact?.contactContactInformation?.firstName}{" "}
                  {payment.contact?.contactContactInformation?.lastName}
                </p>
                {payment.contact?.contactContactInformation?.company && (
                  <p className="text-muted-foreground text-sm">
                    {payment.contact?.contactContactInformation?.company}
                  </p>
                )}
              </div>
            )}
          </div>
        </TableCell>

        <TableCell>
          {payment.contact?.contactTelecomInformation?.email ? (
            <span className="text-sm">
              {payment.contact?.contactTelecomInformation?.email}
            </span>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              <span>No Email</span>
            </Badge>
          )}
        </TableCell>

        <TableCell>
          {nextPaymentDate.dueDate ? (
            <div className="flex flex-col">
              <span
                className={
                  nextPaymentDate.isLate ? "text-destructive font-medium" : ""
                }
              >
                {nextPaymentDate.dueDate}
              </span>
              {nextPaymentDate.isLate && (
                <Badge variant="destructive" className="w-fit mt-1">
                  Late
                </Badge>
              )}
            </div>
          ) : (
            "-"
          )}
        </TableCell>

        <TableCell>
          {formatDateToString(payment.purchase?.createdAt as Date)}
        </TableCell>

        <TableCell className="font-medium">${balance.toFixed(2)}</TableCell>

        <TableCell>{payment.invoiceNumber || "-"}</TableCell>
      </TableRow>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
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

              <TabsContent value="all-payments" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectAll}
                              onCheckedChange={() => toggleAllCheckboxes()}
                              id="select-all"
                            />
                            <Label htmlFor="select-all">Contact</Label>
                          </div>
                        </TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Next Payment Due</TableHead>
                        <TableHead>Purchased On</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Invoice Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPayments?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No payments found for this year
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedPayments?.map((payment) =>
                          renderPaymentRow(payment)
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => {
                            const newPage = Math.max(1, currentPage - 1);
                            setCurrentPage(newPage);
                          }}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {paginationItems.map((item, i) =>
                        item === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={item}>
                            <PaginationLink
                              isActive={currentPage === item}
                              onClick={() => setCurrentPage(item as number)}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            const newPage = Math.min(totalPages, currentPage + 1);
                            setCurrentPage(newPage);
                          }}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </TabsContent>

              <TabsContent value="this-month" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Next Payment Due</TableHead>
                        <TableHead>Purchased On</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Invoice Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPayments?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No payments due this month
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedPayments?.map((payment) =>
                          renderPaymentRow(payment)
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => {
                            const newPage = Math.max(1, currentPage - 1);
                            setCurrentPage(newPage);
                          }}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {paginationItems.map((item, i) =>
                        item === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={item}>
                            <PaginationLink
                              isActive={currentPage === item}
                              onClick={() => setCurrentPage(item as number)}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            const newPage = Math.min(totalPages, currentPage + 1);
                            setCurrentPage(newPage);
                          }}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <InvoiceSending
          paymentOverviews={selectedPayments}
          invoiceType={invoiceType}
          onSendInvoices={() => setStep((prev) => prev - 1)}
        />
      )}
    </div>
  );
};

export default BillingPage;
