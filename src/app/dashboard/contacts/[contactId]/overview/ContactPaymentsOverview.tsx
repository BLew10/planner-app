import { useState, useMemo } from "react";
import { ALL_YEARS } from "@/lib/constants";
import { PaymentModel } from "@/lib/models/payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { LayoutGrid, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useContactPayments } from "@/hooks/contact/useContactPayments";
import { DEFAULT_YEAR } from "@/lib/constants";

interface ContactPaymentsOverviewProps {
  contactId: string;
}

const ContactPaymentsOverview = ({
  contactId,
}: ContactPaymentsOverviewProps) => {
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const { payments, isLoading } = useContactPayments({
    contactId,
    year,
  });

  // Group payments by year when "all" is selected
  const groupedPayments = useMemo(() => {
    if (!payments) return null;

    if (year !== "all") {
      return { [year]: payments };
    }

    const grouped: Record<string, Partial<PaymentModel>[]> = {};

    payments.forEach((payment) => {
      const paymentYear = payment.paymentOverview?.year?.toString() || "Unknown";
      if (!grouped[paymentYear]) {
        grouped[paymentYear] = [];
      }
      grouped[paymentYear].push(payment);
    });

    // Sort by year in descending order
    return Object.keys(grouped)
      .sort((a, b) => Number(b) - Number(a))
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as Record<string, Partial<PaymentModel>[]>);
  }, [payments, year]);

  const renderTableView = () => (
    <>
      {groupedPayments &&
        Object.entries(groupedPayments).map(([yearGroup, yearPayments]) => (
          <div key={yearGroup} className="mb-8">
            {year === "all" && (
              <h3 className="text-lg font-semibold mb-3">
                {yearGroup} Calendar Edition Year
              </h3>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Check Number</TableHead>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Calendar Edition Year</TableHead>
                  <TableHead>Calendar Editions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearPayments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                    <TableCell>{payment.paymentDate}</TableCell>
                    <TableCell>{payment.paymentMethod || "—"}</TableCell>
                    <TableCell>{payment.checkNumber || "—"}</TableCell>
                    <TableCell>
                      {payment.paymentOverview?.invoiceNumber || "—"}
                    </TableCell>
                    <TableCell>{payment.paymentOverview?.year || "—"}</TableCell>
                    <TableCell>
                      {payment.purchase?.calendarEditions
                        ?.map((c) => c.code)
                        .join(", ") || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
    </>
  );

  const renderCardView = () => (
    <>
      {groupedPayments &&
        Object.entries(groupedPayments).map(([yearGroup, yearPayments]) => (
          <div key={yearGroup} className="mb-8">
            {year === "all" && (
              <h3 className="text-lg font-semibold mb-3">
                {yearGroup} Calendar Edition Year
              </h3>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {yearPayments.map((payment, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Amount Paid
                      </span>
                      <span className="font-semibold text-lg">
                        ${Number(payment.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Payment Date
                      </span>
                      <span>{payment.paymentDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Payment Method
                      </span>
                      <span>{payment.paymentMethod || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Check Number
                      </span>
                      <span>{payment.checkNumber || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Invoice Number
                      </span>
                      <span>
                        {payment.paymentOverview?.invoiceNumber || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Calendar Edition Year
                      </span>
                      <span>{payment.paymentOverview?.year || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Calendar Editions
                      </span>
                      <span>
                        {payment.purchase?.calendarEditions
                          ?.map((c) => c.code)
                          .join(", ") || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </>
  );

  const renderTableLoadingState = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Date</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Check Number</TableHead>
          <TableHead>Invoice Number</TableHead>
          <TableHead>Calendar Year</TableHead>
          <TableHead>Calendar Editions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3].map((index) => (
          <TableRow key={index}>
            {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
              <TableCell key={cell}>
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderCardLoadingState = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div key={item} className="flex justify-between items-center">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-4">
          <CardTitle className="text-lg">Payments Made</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("card")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="year-select"
            className="text-sm font-medium text-muted-foreground"
          >
            Calendar Advertisement Year
          </label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger id="year-select" className="w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {ALL_YEARS.map((yearOption) => (
                <SelectItem key={yearOption.value} value={yearOption.value}>
                  {yearOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          viewMode === "card" ? (
            renderCardLoadingState()
          ) : (
            renderTableLoadingState()
          )
        ) : !groupedPayments || Object.keys(groupedPayments).length === 0 ? (
          <div className="text-center py-4">No payments found</div>
        ) : viewMode === "card" ? (
          renderCardView()
        ) : (
          renderTableView()
        )}
      </CardContent>
    </Card>
  );
};

export default ContactPaymentsOverview;
