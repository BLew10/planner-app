import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./Statement.module.scss";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { ScheduledPayment } from "@prisma/client";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import { generateDaySuffix } from "@/lib/helpers/generateDaySuffix";

interface StatementProps {
  paymentOverview: Partial<PaymentOverviewModel> | null;
}

interface NextPayment {
  dueDate: string;
  amount: number;
}

interface PastDue {
  pastDueAmount: number;
  noPastDueCount: number;
}

const rightAlignedX = 200;
const leftAlignedX = 10;
const centerAlignedX = 105;
const Statement = ({ paymentOverview }: StatementProps) => {
  const getTotalPaid = () => {
    let totalPaid = 0;
    paymentOverview?.payments?.forEach((payment) => {
      totalPaid += Number(payment.amount || 0);
    });
    return totalPaid;
  };
  const generateStatementTable = () => {
    const lateFee = calculateLateFee();
    const prePaymentAmount =
      paymentOverview?.prepaid &&
      paymentOverview?.payments &&
      paymentOverview?.payments.length > 0
        ? Number(paymentOverview?.payments[0].amount || 0)
        : 0;

    let balance = Number(paymentOverview?.net || 0) + prePaymentAmount;
    const tableData = [];
    const firstRow = [
      formatDateToString(paymentOverview?.purchase?.createdAt as Date),
      `${paymentOverview?.year} TOWN PLANNER`,
      `$${balance.toFixed(2)}`,
      `$${balance.toFixed(2)}`,
    ];
    tableData.push(firstRow);
    const combinedPayments = [
      ...(paymentOverview?.payments?.map((payment) => ({
        date: payment.paymentDate as string,
        type: "Payment",
        amount: payment.amount,
        paymentMethod: payment.paymentMethod || "Deposit",
        isLate: false, // Default to false for payments
        lateFee: null, // Default to null for payments
      })) || []),
      ...(paymentOverview?.scheduledPayments?.map((scheduled) => ({
        date: scheduled.dueDate as string,
        type: "ScheduledPayment",
        amount: scheduled.amount, // You might or might not need this depending on your structure
        paymentMethod: "Scheduled", // Default or indicative value
        isLate: true,
      })) || []),
    ];

    combinedPayments.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    combinedPayments.forEach((payment) => {
      if (payment.type === "ScheduledPayment" && payment.isLate) {
        balance += lateFee || 0;
        const lateFeeRow = [
          payment.date,
          "Late Fee",
          `+$${lateFee?.toFixed(2)}`,
          `$${balance.toFixed(2)}`,
        ];
        tableData.push(lateFeeRow);
      } else if (payment.type === "Payment") {
        balance -= Number(payment.amount || 0);
        const paymentRow = [
          payment.date,
          payment.paymentMethod,
          `-$${Number(payment.amount || 0)?.toFixed(2)}`,
          `$${balance.toFixed(2)}`,
        ];
        tableData.push(paymentRow);
      }
    });

    return tableData;
  };

  const calculateLateFee = (): number | null => {
    if (paymentOverview?.lateFeePercent) {
      const fee =
        Number(paymentOverview?.totalSale || 0) *
        (Number(paymentOverview?.lateFeePercent || 0) / 100);
      return fee;
    } else if (paymentOverview?.lateFee) {
      return Number(paymentOverview?.lateFee || 0);
    }
    return null;
  };

  const getPastDueAmount = (): PastDue => {
    const today = new Date(2022, 0, 1);
    let pastDueAmount = 0;
    let noPastDueCount = 0;
    const lateFee = calculateLateFee();

    paymentOverview?.scheduledPayments
      ?.filter(
        (scheduled: ScheduledPayment) => new Date(scheduled.dueDate) > today
      )
      .forEach((scheduled: ScheduledPayment) => {
        const dueDate = new Date(scheduled.dueDate);
        const paymentAmount =
          paymentOverview?.payments?.reduce((acc, payment) => {
            const paymentDate = new Date(payment.paymentDate as string);
            if (paymentDate <= dueDate) {
              pastDueAmount++;
              acc += Number(payment.amount || 0) + (lateFee || 0);
            }
            return acc;
          }, 0) || 0;

        if (paymentAmount < Number(scheduled.amount)) {
          // Add the unpaid amount to past due
          pastDueAmount += Number(scheduled.amount) - paymentAmount;
        }
      });

    return { pastDueAmount, noPastDueCount };
  };

  const getNextPayment = (): NextPayment => {
    const today = new Date();
    let nextPayment: NextPayment = { dueDate: "", amount: 0 };
    let totalPaid = getTotalPaid();
    for (const payment of paymentOverview?.scheduledPayments || []) {
      totalPaid -= Number(payment.amount || 0);
      if (
        new Date(payment.dueDate) > today &&
        totalPaid < Number(payment.amount || 0)
      ) {
        nextPayment = {
          dueDate: payment.dueDate,
          amount: Number(payment.amount || 0) - (totalPaid < 0 ? 0 : totalPaid), // Subtract the amount already paid, if it's negative, set it to 0
        };
        break;
      }
    }
    return nextPayment;
  };

  const generatePdf = () => {
    const doc = new jsPDF();
    doc.setFont("Times", "normal", "400");
    doc.setFontSize(12);
    doc.text("Town Planner", leftAlignedX, 25);
    doc.text("P.O. Box 188", leftAlignedX, 30);
    doc.text("Elk Grove, CA 95759", leftAlignedX, 35);

    // Contact Information
    doc.text("Tel: 916-217-0106", rightAlignedX, 25, { align: "right" });
    doc.text("Fax: ", rightAlignedX, 30, { align: "right" }); // Add actual fax number
    doc.text("carter@metrotownplanner.com", rightAlignedX, 35, {
      align: "right",
    });
    doc.setFont("Times", "normal", "700");
    doc.text(
      `Your Town Planner Representative: Joyce Nazabal`,
      rightAlignedX,
      45,
      {
        align: "right",
      }
    );
    doc.text(`${paymentOverview?.year} TOWN PLANNER`, rightAlignedX, 50, {
      align: "right",
    });

    doc.setFont("Times", "normal", "400");
    doc.text(
      `${formatDateToString(
        paymentOverview?.purchase?.createdAt || new Date()
      )}`,
      rightAlignedX,
      55,
      {
        align: "right",
      }
    );

    // Sponsor Information
    let currentY = 65;
    doc.text(
      `Tel: ${
        paymentOverview?.contact?.contactTelecomInformation?.phone || ""
      }`,
      rightAlignedX,
      currentY,
      {
        align: "right",
      }
    );
    doc.text(
      `${paymentOverview?.contact?.contactTelecomInformation?.email || ""}`,
      rightAlignedX,
      currentY + 5,
      {
        align: "right",
      }
    );

    doc.text("Sponsor:", leftAlignedX, currentY);
    const sponsorName = `${
      paymentOverview?.contact?.contactContactInformation?.company || ""
    }`;
    if (sponsorName) {
      doc.text(sponsorName, leftAlignedX, (currentY += 5));
    }
    const sponsorAddress = `${
      paymentOverview?.contact?.contactAddress?.address || ""
    } `;
    if (sponsorAddress) {
      doc.text(sponsorAddress, leftAlignedX, (currentY += 5));
    }
    const sponsorCityStateZip = `${
      paymentOverview?.contact?.contactAddress?.city
        ? `${paymentOverview?.contact?.contactAddress?.city},`
        : ""
    } ${paymentOverview?.contact?.contactAddress?.state || ""} ${
      paymentOverview?.contact?.contactAddress?.zip || ""
    }`;
    if (sponsorCityStateZip) {
      doc.text(sponsorCityStateZip, leftAlignedX, (currentY += 5));
    }

    doc.setFont("Times", "normal", "700");
    doc.setFontSize(16);
    doc.text(
      "*************************Statement*************************",
      centerAlignedX,
      currentY,
      {
        align: "center",
      }
    );
    const tableData = generateStatementTable();

    currentY += 3; // Adjust space to account for text height
    doc.line(15, currentY, 195, currentY);
    doc.setFont("Times", "normal", "400");
    // Itemized Breakdown
    autoTable(doc, {
      startY: currentY,
      theme: "plain",
      head: [["Date", "Description", "Amount", "Balance"]],
      body: tableData,

      styles: { font: "Times" },
      didDrawPage: (data) => {
        currentY = data?.cursor?.y || currentY; // Update currentY after the table is drawn
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        lineColor: [0, 0, 0],
        lineWidth: 0.25,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
      },
    });

    doc.setFontSize(10);
    // Check if there is enough space left on the page
    if (currentY + 30 > 280) {
      // Near the end of a standard PDF page
      doc.addPage();
      currentY = 20; // Reset Y on a new page
    }

    // Footer Note
    if (currentY + 50 > 280) {
      doc.addPage();
      currentY = 20;
    }

    let lateFee = paymentOverview?.lateFee
      ? `$${Number(paymentOverview?.lateFee).toFixed(2) || 0}`
      : paymentOverview?.lateFeePercent
      ? `$${
          (
            Number(paymentOverview?.lateFeePercent || 0 / 100) *
            Number(paymentOverview?.totalSale)
          ).toFixed(2) || 0
        }`
      : null;

      
    let footerY = currentY; // Add some space after the previous content
    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomMargin = 10; // Margin from the bottom of the page
    const footerPositionY = pageHeight - bottomMargin;
    const footerHeight = 150;
    if (doc.internal.pageSize.height - footerY < footerHeight) {
      // Check if there's enough space for the footer; if not, add a new page
      doc.addPage();
      footerY = 20; // Start at the top of the new page
    } else {
      footerY += 20; // Add some space after the previous content
    }
    const dueDay = generateDaySuffix(Number(paymentOverview?.paymentDueOn));
    const firstPaymentDate =
      paymentOverview?.scheduledPayments?.[0]?.dueDate ?? null;
    const lateFeeMessage = ` Starting ${firstPaymentDate}, a late fee of ${lateFee} will be charged for payments not received by the ${
      paymentOverview?.paymentOnLastDay ? "last day" : dueDay
    } of each month.`;
    let footerText = `Thank you for Sponsoring your Town Planner Community Calendar. Please be aware payments are to be received no later than the ${
      paymentOverview?.paymentOnLastDay ? " last day" : dueDay
    } of each month.${
      lateFee ? lateFeeMessage : ""
    } A $25 fee will be charged for any NSF payment. Thank you.`;

    doc.text(footerText, leftAlignedX, footerY, { maxWidth: 180 });
    doc.setFont("Times", "normal", "700");

    doc.text(
      "-------------------------Please return the below portion with your payment------------------------",
      centerAlignedX,
      (footerY += 30),
      {
        align: "center",
      }
    );
    doc.setFont("Times", "normal", "400");

    let footerContactY = footerY;
    if (sponsorName) {
      doc.text(sponsorName, leftAlignedX, (footerContactY += 10));
    }
    if (sponsorAddress) {
      doc.text(sponsorAddress, leftAlignedX, (footerContactY += 5));
    }

    if (sponsorCityStateZip) {
      doc.text(sponsorCityStateZip, leftAlignedX, (footerContactY += 5));
    }
    doc.text(
      `Amount Due this Statement for Invoice #${
        paymentOverview?.invoiceNumber || "" // TODO Add invoice number
      }`,
      rightAlignedX,
      (footerY += 10),
      {
        align: "right",
      }
    );

    const pastDue = getPastDueAmount();
    const nextPayment = getNextPayment();
    doc.text(
      `PAST DUE AMOUNT: $${pastDue.pastDueAmount.toFixed(2)}`,
      rightAlignedX,
      (footerY += 8),
      {
        align: "right",
      }
    );
    doc.text(
      `PLUS CURRENT AMOUNT DUE IF PAID BY ${
        nextPayment.dueDate
      }: $${nextPayment.amount.toFixed(2)}`,
      rightAlignedX,
      (footerY += 8),
      {
        align: "right",
      }
    );

    doc.setFont("Times", "normal", "700");
    doc.text(
      `TOTAL AMOUNT DUE IF PAID BY ${nextPayment.dueDate}: $${(
        nextPayment.amount + pastDue.pastDueAmount
      ).toFixed(2)}`,
      rightAlignedX,
      (footerY += 8),
      {
        align: "right",
      }
    );

    footerY += 10;
    doc.setFont("Times", "normal", "700");
    doc.setFontSize(10);
    doc.text("Please remit to:", leftAlignedX, footerY);
    doc.text("Credit Card Payments:", rightAlignedX - 90, footerY);

    doc.setFont("Times", "normal", "400");
    doc.text("Town Planner", leftAlignedX, footerY + 10);
    doc.text("P.O. Box 188", leftAlignedX, footerY + 15);
    doc.text("Elk Grove, CA 95759", leftAlignedX, footerY + 20);

    doc.text(
      "Name on Card: ____________________________________",
      rightAlignedX - 90,
      footerY + 10
    );
    doc.text(
      "Card No.: ________________________________________",
      rightAlignedX - 90,
      footerY + 18
    );
    doc.text(
      "Exp. Date: ___________   3-Digit Sec. Code: ___________",
      rightAlignedX - 90,
      footerY + 26
    );
    doc.text(
      "Billing Address: __________________________________",
      rightAlignedX - 90,
      footerY + 34
    );
    doc.text(
      "Billing Zip/PC: __________  Amt. Paid: $______________",
      rightAlignedX - 90,
      footerY + 42
    );
    // Save the PDF
    doc.save("Invoice.pdf");
  };

  return (
    <div>
      <button onClick={generatePdf} className={styles.button}>
        Download Statement
      </button>
    </div>
  );
};

export default Statement;
