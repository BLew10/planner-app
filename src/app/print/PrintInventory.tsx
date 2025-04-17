"use client";
import jsPDF from "jspdf";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllSlotsByCalendarEditionYearAndCalendarId } from "@/lib/data/purchase";
import { Advertisement } from "@prisma/client";
import { CalendarEdition } from "@prisma/client";
import { SlotInfo } from "@/lib/data/purchase";
import PrintCalendarInventory from "./PrintCalendarInventory";
import { MONTHS } from "@/lib/constants";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/shadcn/use-toast";
import { Loader2, FileDown } from "lucide-react";

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
  const [slotData, setSlotData] = useState<Record<string, SlotInfo[]> | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  const generatePDF = async () => {
    try {
      setIsGeneratingPdf(true);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Add header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${calendar.name} - ${year}`, margin, yPos);
      yPos += 12;

      advertisementTypes?.forEach((adType) => {
        const slots = slotData?.[adType.id || ""] || [];
        const monthlySlots: Record<number, SlotInfo[]> = {};

        slots.forEach((slot) => {
          const month = slot.month || 1;
          if (!monthlySlots[month]) monthlySlots[month] = [];
          monthlySlots[month].push(slot);
        });

        // Check if we need a new page
        if (yPos > pageHeight - margin * 2) {
          doc.addPage();
          yPos = margin;
        }

        // Add ad type header
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${adType.name} (${adType.perMonth || 0} per month)`, margin, yPos);
        yPos += 8;

        if (!adType.perMonth) {
          // Special ad types (non-monthly)
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          
          // Create a grid for special slots
          const colWidth = 65;
          const rowHeight = 7;
          let currentX = margin;
          let maxY = yPos;

          slots.forEach((slot, index) => {
            if (currentX > pageWidth - colWidth - margin) {
              currentX = margin;
              yPos = maxY + rowHeight;
            }
            
            doc.text(`Slot ${slot.slot}: ${slot.contactCompany || ''}`, currentX, yPos);
            currentX += colWidth;
            maxY = Math.max(maxY, yPos);
          });
          
          yPos = maxY + 15;
        } else {
          // Regular monthly ads
          MONTHS.forEach((month, monthIndex) => {
            // Check if we need a new page
            if (yPos > pageHeight - margin * 2) {
              doc.addPage();
              yPos = margin;
            }

            // Add month header
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(month, margin, yPos);
            yPos += 8;

            // Calculate dimensions
            const availableWidth = pageWidth - (2 * margin);
            const slotSpacing = 10;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            let currentX = margin;
            let currentY = yPos;
            const lineHeight = 7;

            // Draw slots with wrapping
            for (let slotNum = 1; slotNum <= (adType.perMonth || 0); slotNum++) {
              const slot = monthlySlots[monthIndex + 1]?.find(s => s.slot === slotNum);
              const slotText = slot ? `${slotNum}. ${slot.contactCompany || ''}` : `${slotNum}. Available`;
              
              // Measure text width
              const textWidth = doc.getTextWidth(slotText);
              
              // Check if we need to wrap to next line
              if (currentX + textWidth > pageWidth - margin) {
                currentX = margin;
                currentY += lineHeight;
              }

              // Check if we need a new page
              if (currentY > pageHeight - margin) {
                doc.addPage();
                currentY = margin;
              }

              doc.text(slotText, currentX, currentY);
              currentX += textWidth + slotSpacing;
            }

            yPos = currentY + lineHeight + 10; // Add space after month's slots
          });

          yPos += 5; // Add extra space after all months
        }
      });

      // Add page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin,
          pageHeight - margin,
          { align: "right" }
        );
      }

      doc.save(`${calendar.name}-${year}-inventory.pdf`);
      toast({
        title: "Success",
        description: "PDF has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    const fetchData = async (selectedYear: string) => {
      setFetching(true);
      try {
        const adIds = advertisementTypes?.map((ad) => ad.id) || [];
        const slots = await getAllSlotsByCalendarEditionYearAndCalendarId(
          calendar.id || "",
          selectedYear,
          adIds
        );
        setSlotData(slots || null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch calendar data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setFetching(false);
      }
    };
    fetchData(year);
  }, [year, calendar.id, advertisementTypes, toast]);

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">{calendar.name}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={generatePDF}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="print-section">
          <PrintCalendarInventory
            slots={slotData}
            advertisementTypes={advertisementTypes}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintInventory;
