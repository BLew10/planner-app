import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCashFlowReport } from "@/hooks/billing/useCashFlowReport";

// Define props interface to receive the shared state
interface CashFlowReportTabProps {
  selectedCalendarYear: string;
  onCalendarYearChange: (value: string) => void;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CashFlowReportTab = ({
  selectedCalendarYear,
  onCalendarYearChange,
}: CashFlowReportTabProps) => {
  const {
    cashFlowData,
    isLoading,
    selectedCompany,
    setSelectedCompany,
    companies,
    reportDate,
    handleGeneratePDF,
  } = useCashFlowReport(selectedCalendarYear);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Cash Flow Report</h2>
              <p className="text-muted-foreground">As of {reportDate}</p>
            </div>
            <div className="flex space-x-4 items-end">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="company-select">Company</Label>
                <Select
                  value={selectedCompany}
                  onValueChange={setSelectedCompany}
                >
                  <SelectTrigger id="company-select" className="w-[180px]">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Calendar year selector removed from here */}
              {/* <Button onClick={handleGeneratePDF}>
                <FileDown className="mr-2 h-4 w-4" />
                Generate PDF
              </Button> */}
            </div>
          </div>

          <div className="text-muted-foreground text-sm space-y-2">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-sm">
                  Projected Totals (amount of revenue that should be collected
                  in each month)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-black rounded-full"></div>
                <p className="text-sm">
                  Accounts Actual (amount of revenue that has been collected
                  each month)
                </p>
              </div>
              <p className="text-muted-foreground mt-1 italic">
                Note: Prepayments are included in both projected and actual
                amounts for the month they occur.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Account</TableHead>
                  {MONTHS.map((month) => (
                    <TableHead key={month}>{month}</TableHead>
                  ))}
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashFlowData.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {entry.name}
                      {entry.isInactive && (
                        <span className="text-sm text-muted-foreground ml-1">
                          (inactive)
                        </span>
                      )}
                    </TableCell>
                    {MONTHS.map((month) => {
                      const monthData = entry.months[month.toLowerCase()];
                      return (
                        <TableCell key={month}>
                          {monthData && (
                            <div className="space-y-1">
                              {monthData.projected !== undefined && (
                                <div className="text-green-600">
                                  {monthData.projected.toFixed(2)}
                                </div>
                              )}
                              {monthData.actual !== undefined && (
                                <div>{monthData.actual.toFixed(2)}</div>
                              )}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-green-600">
                          {entry.yearTotal.projected.toFixed(2)}
                        </div>
                        <div>{entry.yearTotal.actual.toFixed(2)}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Summary row */}
                <TableRow className="font-bold">
                  <TableCell>Totals</TableCell>
                  {MONTHS.map((month) => {
                    // Calculate monthly totals
                    const monthlyProjected = cashFlowData.reduce(
                      (sum, entry) =>
                        sum +
                        (entry.months[month.toLowerCase()]?.projected || 0),
                      0
                    );
                    const monthlyActual = cashFlowData.reduce(
                      (sum, entry) =>
                        sum + (entry.months[month.toLowerCase()]?.actual || 0),
                      0
                    );
                    return (
                      <TableCell key={month}>
                        <div className="space-y-1">
                          <div className="text-green-600">
                            {monthlyProjected.toFixed(2)}
                          </div>
                          <div>{monthlyActual.toFixed(2)}</div>
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-green-600">
                        {cashFlowData
                          .reduce(
                            (sum, entry) => sum + entry.yearTotal.projected,
                            0
                          )
                          .toFixed(2)}
                      </div>
                      <div>
                        {cashFlowData
                          .reduce(
                            (sum, entry) => sum + entry.yearTotal.actual,
                            0
                          )
                          .toFixed(2)}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowReportTab;
