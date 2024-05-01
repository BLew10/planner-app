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
const InvoiceTotalStatement = ({
  paymentOverview,
}: InvoiceTotalStatementProps) => {
  interface GroupedAdPurchases {
    calendarName: string;
    calendarId: string;
    adPurchases: Partial<AdvertisementPurchaseModel>[];
  }

  const groupCalendarInfo = (
    calendarData: Partial<AdvertisementPurchaseModel>[] | null | undefined
  ) => {
    console.log(paymentOverview);
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

  const generatePaypPlan = (scheduledPayments: ScheduledPayment[]): string => {
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

  const generatePdf = () => {
    const doc = new jsPDF();
    const calendarData = groupCalendarInfo(
      paymentOverview?.purchase?.adPurchases || []
    );

    doc.setFont("Courier", "normal", "400");
    doc.setFontSize(10);
    doc.text("Town Planner", leftAlignedX, 25);
    doc.text("P.O. Box 188", leftAlignedX, 30);
    doc.text("Elk Grove, CA 95759", leftAlignedX, 35);

    // Contact Information
    doc.text("Tel: 916-217-0106", rightAlignedX, 25, { align: "right" });
    doc.text("Fax: ", rightAlignedX, 30, { align: "right" }); // Add actual fax number
    doc.text("carter@metrotownplanner.com", rightAlignedX, 35, {
      align: "right",
    });

    doc.text(
      `Your Town Planner Representative: Joyce Nazabal`,
      leftAlignedX,
      50
    );
    doc.text(`${paymentOverview?.year} TOWN PLANNER`, rightAlignedX, 50, {
      align: "right",
    });
    doc.text(`${formatDateToString(paymentOverview?.purchase?.createdAt || new Date())}`,
      rightAlignedX,
      55,
      { align: "right" }
    );

    doc.setFont("Courier", "normal", "700");
    doc.text(`INVOICE #${paymentOverview?.id}`, rightAlignedX, 70, { // TODO add invoice number
      align: "right",
    });
    doc.setFont("Courier", "normal", "400");

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
      `Fax: ${paymentOverview?.contact?.contactTelecomInformation?.fax || ""}`,
      rightAlignedX,
      currentY + 5,
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

    const netArray = [
      "",
      "TOTAL AMOUNT OF PURCHASE",
      `$${Number(paymentOverview?.net).toFixed(2) || 0}`,
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

    transfomedData = [
      ...transfomedData,
      ["", "", "-------"],
      ["", "", ""],
      totalArray,
      ...discounts,
      netArray,
    ];

    currentY += 10;

    doc.setFont("Courier", "normal", "700");
    doc.text("Editions", 20, currentY, { align: "left" });
    doc.text("Description", 70, currentY, { align: "left" });
    doc.text("Total", 170, currentY, { align: "left" });

    currentY += 3; // Adjust space to account for text height
    doc.line(15, currentY, 195, currentY);
    doc.setFont("Courier", "normal", "400");
    // Itemized Breakdown
    autoTable(doc, {
      startY: currentY,
      theme: "plain",
      body: transfomedData,
      styles: { font: "Courier" },
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

    const payPlan = generatePaypPlan(paymentOverview?.scheduledPayments || []);
    doc.setFontSize(10);
    doc.setFont("", "normal", "700");
    currentY += 20;
    doc.text(payPlan, leftAlignedX, currentY, { maxWidth: 180 });
    doc.setFont("", "normal", "400");

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
    if (doc.internal.pageSize.height - footerY < 100) {
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
    let footerText = `Thank you for Sponsoring your Town Planner Community Calendar. Please be aware payments are to be received no later than  ${
      paymentOverview?.paymentOnLastDay ? "the last day" : dueDay
    } of each month.${
      lateFee ? lateFeeMessage : ""
    } A $25 fee will be charged for any NSF payment. Thank you.`;
    doc.text(footerText, leftAlignedX, footerY, { maxWidth: 180 });
    // Save the PDF
    doc.save("Invoice.pdf");
  };

  return (
    <div>
      <button onClick={generatePdf} className={styles.button}>
        Proof
      </button>
    </div>
  );
};

export default InvoiceTotalStatement;
