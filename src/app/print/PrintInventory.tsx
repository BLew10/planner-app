"use client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import React, { useState, useEffect, useRef } from "react";
import styles from "./PrintInventory.module.scss";
import { useRouter } from "next/navigation";
import { getAllSlotsByCalendarEditionYearAndCalendarId } from "@/lib/data/purchase";
import { Advertisement } from "@prisma/client";
import { CalendarEdition } from "@prisma/client";
import LoadingSpinner from "../(components)/general/LoadingSpinner";
import AnimateWrapper from "../(components)/general/AnimateWrapper";
import CalendarInventory from "../dashboard/CalendarInventory";
import { SlotInfo } from "@/lib/data/purchase";
import createCalendarPDF from "./(hooks)/useSlotsPDF";

const defaultYear = "2023";
interface PrintInventoryProps {
  advertisementTypes: Partial<Advertisement>[] | null;
  calendar: Partial<CalendarEdition>;
  year: string;
}
const PrintInventory = ({
  advertisementTypes,
  calendar,
  year,
}: PrintInventoryProps) => {
  const [slotData, setSlotData] = useState<Record<string, SlotInfo[]> | null>(
    null
  );
  const router = useRouter();
  const printRef = useRef(null);
    const handleDownloadPdf = async () => {
    const element = printRef.current as HTMLDivElement | null;
    if (!element) {
      return;
    }
    element.children[1].classList.add(styles.hide);
    const canvas = await html2canvas(element, {
      scale: 1,
      scrollY: -window.scrollY, // Adjusts how the canvas interprets the Y-axis scroll
      useCORS: true, // Helps with external images if any, just in case
    });
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
    });
    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    const totalHeight = imgProps.height;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const numPages = Math.ceil(totalHeight / pdfHeight);
    for (let i = 0; i < numPages; i++) {
      if (i > 0) pdf.addPage();
      const offsetY = i * pageHeight;
      pdf.addImage(data, "PNG", 0, -offsetY, pdfWidth, pdfHeight);
    }
    element.children[1].classList.remove(styles.hide);
    pdf.save("calendar-inventory.pdf");
  };

  const [fetching, setFetching] = useState(true);

  useEffect(() => {

    const fetchData = async (selectedYear: string) => {
      setFetching(true);
      const adIds = advertisementTypes?.map((ad) => ad.id) || [];
      const slots = await getAllSlotsByCalendarEditionYearAndCalendarId(
        calendar.id || "",
        selectedYear,
        adIds
      );
      setFetching(false);
      setSlotData(slots || null);
    };
    fetchData(year);
  }, []);
// const previewPDF = () => {
//   createCalendarPDF({ slots: slotData, advertisementTypes });
// }

  return (
    <AnimateWrapper>
      <div className={styles.container} ref={printRef} id={`${calendar.id}-print`}>
        <h1 className={styles.title}>{calendar.name}</h1>
        <button onClick={handleDownloadPdf} className={`excluded ${styles.pdfButton}`}>
          Download PDF
        </button>
        {fetching ? (
          <LoadingSpinner />
        ) : (
          <div className="print-section">
          <CalendarInventory
            slots={slotData}
            advertisementTypes={advertisementTypes}
          />
        </div>
        )}
      </div>
    </AnimateWrapper>
  );
};

export default PrintInventory;
