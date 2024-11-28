import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
import { useContactScheduledPayments } from "@/hooks/contact/useContactScheduledPayments";
import { ALL_YEARS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactScheduledPaymentsProps {
  contactId: string;
}

const ContactScheduledPayments = ({
  contactId,
}: ContactScheduledPaymentsProps) => {
  const nextYear = String(new Date().getFullYear() + 1);
  const [selectedYear, setSelectedYear] = useState<string>(nextYear);

  const {
    scheduledPayments,
    paymentWaivers,
    handleWaiverChange,
    isLoading,
    updateLateFees,
  } = useContactScheduledPayments({
    contactId,
    year: selectedYear,
  });

  console.log(scheduledPayments);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Payment Schedules</CardTitle>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="year-select"
            className="text-sm font-medium text-muted-foreground"
          >
            Calendar Advertisement Year
          </label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger id="year-select" className="w-[180px]">
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
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Late Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Waive Late Fee?</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                  </TableRow>
                ))}
              </>
            ) : !scheduledPayments || scheduledPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No scheduled payments found
                </TableCell>
              </TableRow>
            ) : (
              scheduledPayments?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.dueDate}</TableCell>
                  <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                  <TableCell>${Number(payment.amountPaid).toFixed(2)}</TableCell>
                  <TableCell>
                    {payment.lateFee ? (
                      `$${Number(payment.lateFee).toFixed(2)}`
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-sm font-medium",
                        payment.isPaid
                          ? "bg-green-100 text-green-700"
                          : payment.isLate
                          ? "bg-destructive/10 text-destructive"
                          : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {payment.isPaid 
                        ? "Paid" 
                        : payment.isLate 
                        ? "Late" 
                        : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {payment.paymentDate || '-'}
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={paymentWaivers.find(w => w.id === payment.id)?.waived}
                      onCheckedChange={(checked) => {
                        handleWaiverChange(payment.id, !!checked);
                      }}
                      disabled={payment.isPaid}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={updateLateFees}
            disabled={!scheduledPayments?.length || isLoading}
          >
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactScheduledPayments;
