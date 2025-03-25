import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./InvoiceTotalStatement.module.scss";
import { PaymentOverviewModel } from "@/lib/models/paymentOverview";
import { ScheduledPayment } from "@prisma/client";
import { AdvertisementPurchaseModel } from "@/lib/models/advertisementPurchase";
import { formatDateToString } from "@/lib/helpers/formatDateToString";
import { generateDaySuffix } from "@/lib/helpers/generateDaySuffix";

interface InvoiceTotalStatementProps {
  paymentOverview: Partial<PaymentOverviewModel> | null;
}
const rightAlignedX = 200;
const leftAlignedX = 10;
const centerAlignedX = 105;
const groupCalendarInfo = (
  calendarData: Partial<AdvertisementPurchaseModel>[] | null | undefined
) => {
  const groupedData = calendarData?.reduce(
    (acc: Record<string, GroupedAdPurchases>, adPurchase) => {
      // Use calendarEditionId as the key to group purchases
      const { calendarId, calendar } = adPurchase;
      if (!acc[calendarId!]) {
        acc[calendarId!] = {
          calendarId: calendarId || "",
          calendarName: calendar?.name || "Unknown Calendar", // Handle missing calendar names
          adPurchases: [] as Partial<AdvertisementPurchaseModel>[],
        };
      }

      acc[calendarId!].adPurchases.push(adPurchase);
      return acc;
    },
    {}
  );

  // Convert the record object to an array of values
  const values = groupedData ? Object.values(groupedData) : [];

  return values;
};

const generatePayPlan = (scheduledPayments: ScheduledPayment[]): string => {
  let plan = "PAY PLAN: ";
  for (let i = 0; i < scheduledPayments.length; i++) {
    const payment = scheduledPayments[i];
    const amount = Number(payment.amount).toFixed(2);
    const dueDate = payment.dueDate;
    if (i === 0) {
      plan += `$${amount} due on ${dueDate}`;
    } else if (i === scheduledPayments.length - 1) {
      plan += `, and $${amount} due on ${dueDate}.`;
    } else {
      plan += `, $${amount} due on ${dueDate}`;
    }
  }

  return plan;
};

const calculateLateFee = ( paymentOverview: Partial<PaymentOverviewModel> | null): number | null => {
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
export const generateInvoiceTotalStatementPdf = (paymentOverview: Partial<PaymentOverviewModel> | null) => {
  const doc = new jsPDF();
  const calendarData = groupCalendarInfo(
    paymentOverview?.purchase?.adPurchases || []
  );

  doc.setFont("Times", "normal", "400");
  doc.setFontSize(10);
  doc.text("Publishing Concepts LLC", leftAlignedX, 25);
  doc.text("P.O. Box 188", leftAlignedX, 30);
  doc.text("Elk Grove, CA 95759", leftAlignedX, 35);

  // Contact Information
  doc.text("Tel: 916-217-0106", rightAlignedX, 25, { align: "right" });
  doc.text("joyce@metrocalendars.com", rightAlignedX, 35, {
    align: "right",
  });

  doc.text(
    `Publisher: Joyce Nazabal`,
    leftAlignedX,
    50
  );
  doc.text(`${paymentOverview?.calendarEditionYear} Calendar`, rightAlignedX, 50, {
    align: "right",
  });
  doc.text(`${formatDateToString(paymentOverview?.purchase?.createdAt || new Date())}`,
    rightAlignedX,
    55,
    { align: "right" }
  );

  doc.setFont("Times", "normal", "700");
  doc.text(`INVOICE #${paymentOverview?.invoiceNumber}`, rightAlignedX, 70, { // TODO add invoice number
    align: "right",
  });
  doc.setFont("Times", "normal", "400");

  // Sponsor Information
  let currentY = 80;
  doc.text(
    `Tel: ${
      paymentOverview?.contact?.contactTelecomInformation?.phone || ""
    }`,
    rightAlignedX,
    currentY,
    { align: "right" }
  );
  doc.text(
    `${paymentOverview?.contact?.contactTelecomInformation?.email || ""}`,
    rightAlignedX,
    currentY + 10,
    { align: "right" }
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

  const processedCalendarIds = new Set();

  const calendarTableData = calendarData.flatMap((calendar) => {
    return calendar.adPurchases.map((adPurchase) => {
      const isNewCalendarId = !processedCalendarIds.has(calendar.calendarId);
      // Add the current calendarId to the set after checkin`g
      processedCalendarIds.add(calendar.calendarId);
      return {
        // Only set the calendarName and calendarId for the first occurrence
        calendarName: isNewCalendarId ? String(calendar.calendarName) : "",
        adType: String(adPurchase.advertisement?.name) || "",
        quantity: String(adPurchase.quantity) || 0,
        total: `$${String(Number(adPurchase.charge)?.toFixed(2) || 0)}`,
      };
    });
  });

  let transfomedData = calendarTableData.map((data) => {
    return [data.calendarName, `${data.quantity} ${data.adType}`, data.total];
  });

  const lateFee = calculateLateFee(paymentOverview);
  const totalLateFeesAdded = paymentOverview?.scheduledPayments?.filter((payment) => payment.lateFeeAddedToNet
  ).length || 0;

  const netArray = [
    "",
    "TOTAL AMOUNT OF PURCHASE",
    `$${(Number(paymentOverview?.net) - (Number(lateFee) * totalLateFeesAdded)).toFixed(2) || 0}`,
  ];

  const totalArray = [
    "",
    "Total",
    `$${Number(paymentOverview?.totalSale).toFixed(2) || 0}`,
  ];
  let discounts = [];
  if (paymentOverview?.additionalDiscount1) {
    discounts.push([
      "",
      "Additional Discount 1",
      `-$${Number(paymentOverview?.additionalDiscount1).toFixed(2) || 0}`,
    ]);
  }
  if (paymentOverview?.additionalDiscount2) {
    discounts.push([
      "",
      "Additional Discount 2",
      `-$${Number(paymentOverview?.additionalDiscount2).toFixed(2) || 0}`,
    ]);
  }
  if (paymentOverview?.additionalSales1) {
    discounts.push([
      "",
      "Additional Sales 1",
      `-$${Number(paymentOverview?.additionalSales1).toFixed(2) || 0}`,
    ]);
  }
  if (paymentOverview?.additionalSales2) {
    discounts.push([
      "",
      "Additional Sales 2: ",
      `-$${Number(paymentOverview?.additionalSales2).toFixed(2) || 0}`,
    ]);
  }

  if (paymentOverview?.earlyPaymentDiscount) {
    discounts.push([
      "",
      "Early Payment Discount",
      `-$${Number(paymentOverview?.earlyPaymentDiscount).toFixed(2) || 0}`,
    ]);
  }

  if (paymentOverview?.earlyPaymentDiscountPercent) {
    let earlyDiscount =
      (Number(paymentOverview?.earlyPaymentDiscountPercent || 0) / 100) *
      Number(paymentOverview?.totalSale);
    discounts.push([
      "",
      "Early Payment Discount",
      `-$${earlyDiscount.toFixed(2)}`,
    ]);
  }

  if (paymentOverview?.trade) {
    discounts.push([
      "",
      "Trade",
      `-$${Number(paymentOverview?.trade).toFixed(2) || 0}`,
    ]);
  }

  const prePaidPayment = paymentOverview?.payments?.find(
    (payment) => payment.wasPrepaid
  )
  if (prePaidPayment) {
    discounts.push([
      "",
      "Prepaid",
      `-$${Number(prePaidPayment.amount).toFixed(2) || 0}`,
    ]);
  }

  transfomedData = [
    ...transfomedData,
    ["", "", "-------"],
    ["", "", ""],
    totalArray,
    ...discounts,
    netArray,
  ];

  currentY += 10;

  doc.setFont("Times", "normal", "700");
  doc.text("Editions", 20, currentY, { align: "left" });
  doc.text("Description", 70, currentY, { align: "left" });
  doc.text("Total", 170, currentY, { align: "left" });

  currentY += 3; // Adjust space to account for text height
  doc.line(15, currentY, 195, currentY);
  doc.setFont("Times", "normal", "400");
  // Itemized Breakdown
  autoTable(doc, {
    startY: currentY,
    theme: "plain",
    body: transfomedData,
    styles: { font: "Times" },
    didDrawPage: (data) => {
      currentY = data?.cursor?.y || currentY; // Update currentY after the table is drawn
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
  });

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
  const payPlan = generatePayPlan(paymentOverview?.scheduledPayments || []);
  doc.setFontSize(10);
  doc.setFont("", "normal", "700");
  doc.text(payPlan, leftAlignedX, currentY + 20, { maxWidth: 180 });

  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 10; // Margin from the bottom of the page
  const footerPositionY = pageHeight - bottomMargin;
  let footerHeight = 60;
  if (doc.internal.pageSize.height - (currentY + 30) < footerHeight) {
    // Check if there's enough space for the footer; if not, add a new page
    doc.addPage();
    currentY = 20; // Start at the top of the new page
  } else {
    currentY += 20; // Add some space after the previous content
  }

  doc.setFont("", "normal", "400");

  const dueDay = generateDaySuffix(Number(paymentOverview?.paymentDueOn));
  const firstPaymentDate =
    paymentOverview?.scheduledPayments?.[0]?.dueDate ?? null;
  const lateFeeMessage = ` Starting ${firstPaymentDate}, a late fee of $${lateFee?.toFixed(2)} will be charged for payments not received by the ${
    paymentOverview?.paymentOnLastDay ? "last day" : dueDay
  } of each month.`;
  let footerText = `Thank you for Sponsoring your Town Planner Community Calendar. Please be aware payments are to be received no later than the ${
    paymentOverview?.paymentOnLastDay ? " last day" : dueDay
  } of each month.${
    lateFee ? lateFeeMessage : ""
  } A $25 fee will be charged for any NSF payment. Thank you.`;

  doc.text(footerText, leftAlignedX, footerPositionY - footerHeight, { maxWidth: 180 });
  footerHeight -= 20;
  doc.setFont("Times", "normal", "700");

  doc.text(
    "-------------------------Please return the below portion with your payment------------------------",
    centerAlignedX,
    footerPositionY - footerHeight,
    {
      align: "center",
    }
  );
  doc.setFont("Times", "normal", "400");
  footerHeight -= 10;
  doc.setFont("Times", "normal", "700");
  doc.setFontSize(10);
  let remitYDiff = footerHeight;
  let ccDiff = footerHeight;
  doc.text("Please remit to:", leftAlignedX, footerPositionY - remitYDiff);
  remitYDiff -= 10;
  doc.setFont("Times", "normal", "400");
  doc.text("Town Planner", leftAlignedX, footerPositionY - remitYDiff);
  remitYDiff -= 5;
  doc.text("P.O. Box 188", leftAlignedX, footerPositionY - remitYDiff);
  remitYDiff -= 5;
  doc.text("Elk Grove, CA 95759", leftAlignedX, footerPositionY - remitYDiff);
  doc.setFont("Times", "normal", "700");
  doc.text(
    "Credit Card Payments:",
    rightAlignedX - 90,
    footerPositionY - ccDiff
  );
  ccDiff -= 10;
  doc.setFont("Times", "normal", "400");
  doc.text(
    "Name on Card: ____________________________________",
    rightAlignedX - 90,
    footerPositionY - ccDiff
  );

  ccDiff -= 5;
  doc.text(
    "Card No.: ________________________________________",
    rightAlignedX - 90,
    footerPositionY - ccDiff
  );

  ccDiff -= 5;
  doc.text(
    "Exp. Date: ___________   3-Digit Sec. Code: ___________",
    rightAlignedX - 90,
    footerPositionY - ccDiff
  );

  ccDiff -= 5;
  doc.text(
    "Billing Address: __________________________________",
    rightAlignedX - 90,
    footerPositionY - ccDiff
  );

  doc.text(
    "Billing Zip/PC: __________  Amt. Paid: $______________",
    rightAlignedX - 90,
    footerPositionY
  );
  // Save the PDF

  return doc.output('blob');
};
interface GroupedAdPurchases {
  calendarName: string;
  calendarId: string;
  adPurchases: Partial<AdvertisementPurchaseModel>[];
}

const InvoiceTotalStatement = ({
  paymentOverview,
}: InvoiceTotalStatementProps) => {
  const handleDownloadPdf = async () => {
    if (!paymentOverview) {
      console.error('No payment overview provided');
      return;
    }

    try {
      const pdfBlob = await generateInvoiceTotalStatementPdf(paymentOverview);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank'); // Open the PDF in a new tab
    } catch (error) {
      console.error('Error generating or opening PDF:', error);
    }
  };


  return (
    <div>
      <button onClick={handleDownloadPdf} className={styles.button}>
        Proof
      </button>
    </div>
  );
};

export default InvoiceTotalStatement;
