import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SlotInfo } from "@/lib/data/purchase";
import { Advertisement } from "@prisma/client";
import { MONTHS } from "@/lib/constants";

interface UseSlotsPDFProps {
  slots: Record<string, SlotInfo[]> | null;
  advertisementTypes: Partial<Advertisement>[] | null;
}

const createCalendarPDF = ({ slots, advertisementTypes }: UseSlotsPDFProps) => {
  const doc = new jsPDF();

  let currentY = 20;
  advertisementTypes?.forEach((adType) => {
    // Title for the advertisement type
    doc.setFontSize(16);
    doc.text(adType.name || "Advertisement", 14, currentY+=20);


    // Filter slots for the current advertisement type
    const filteredSlots: SlotInfo[] = slots?.[adType.id as string] || [];
    // Organize slots by month
    const slotsByMonth = filteredSlots.reduce(
      (acc: Record<number, SlotInfo[]>, slot) => {
        const monthIndex = slot.month - 1; // Adjust for zero index
        if (!acc[monthIndex]) acc[monthIndex] = [];
        acc[monthIndex].push(slot);
        return acc;
      },
      {}
    );
    // Two tables: first 6 months and next 6 months
    [0, 6].forEach((startMonth) => {
      const tableData = MONTHS.slice(startMonth, startMonth + 6).map(
        (month, index) => {
          const monthSlots = slotsByMonth[startMonth + index] || [];
          const slotDetails = monthSlots
            .map((slot) => `${slot.contactCompany} (${slot.date})`)
            .join(", ");
          return [month, slotDetails];
        }
      );

      // Generate the table for 6 months
      autoTable(doc, {
        startY: currentY+=10,
        theme: "striped",
        head: [["Month", "Slots"]],
        body: tableData,
        styles: { fontSize: 10 },
        didDrawPage: (data) => {
          currentY = data?.cursor?.y || currentY; // Update currentY after the table is drawn
        },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 150 } },
      });
    });
  });

  // Save the PDF
  doc.save("AdvertisingCalendar.pdf");
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank"); 
};

export default createCalendarPDF;
