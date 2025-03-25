import { NextRequest, NextResponse } from "next/server";
import { getCashFlowData } from "@/lib/data/cashFlowReport";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const year =
      searchParams.get("year") || new Date().getFullYear().toString();
    const rep = searchParams.get("rep") || "All";

    // Get data
    const data = await getCashFlowData(year, rep);

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();

    // Add text
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

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
    const currentDate = new Date().toLocaleDateString();

    // Title
    page.drawText(`Cash Flow Report`, {
      x: 50,
      y: height - 50,
      size: 24,
      font: helveticaBold,
    });

    // Date
    page.drawText(`As of ${currentDate}`, {
      x: 50,
      y: height - 80,
      size: 12,
      font: helveticaFont,
    });

    // Year and rep info
    page.drawText(
      `Year: ${year}${rep !== "All" ? ` | Representative: ${rep}` : ""}`,
      {
        x: 50,
        y: height - 100,
        size: 12,
        font: helveticaFont,
      }
    );

    // Legend
    page.drawText(`Projected Totals are in green.`, {
      x: 50,
      y: height - 130,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0.5, 0),
    });

    page.drawText(`Accounts Actual are in black.`, {
      x: 50,
      y: height - 145,
      size: 10,
      font: helveticaFont,
    });

    page.drawText(`Credits are in purple.`, {
      x: 50,
      y: height - 160,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0, 0.5),
    });

    // Table header
    const columnWidth = 60;
    const rowHeight = 40;
    const startX = 50;
    let startY = height - 200;
    let currentX = startX;

    // Company column is wider
    page.drawText("Account", {
      x: currentX,
      y: startY,
      size: 10,
      font: helveticaBold,
    });
    currentX += 120;

    // Draw month headers
    for (const month of MONTHS) {
      page.drawText(month, {
        x: currentX + 10,
        y: startY,
        size: 10,
        font: helveticaBold,
      });
      currentX += columnWidth;
    }

    // Year column
    page.drawText("Year", {
      x: currentX + 10,
      y: startY,
      size: 10,
      font: helveticaBold,
    });

    // Table rows
    startY -= rowHeight;
    let alternateRow = false;

    for (const entry of data) {
      // Draw light background for alternate rows
      if (alternateRow) {
        page.drawRectangle({
          x: startX - 5,
          y: startY - 15,
          width: width - 100,
          height: rowHeight,
          color: rgb(0.95, 0.95, 0.95),
          borderWidth: 0,
        });
      }
      alternateRow = !alternateRow;

      // Reset X position for new row
      currentX = startX;

      // Company name
      page.drawText(entry.name + (entry.isInactive ? " (inactive)" : ""), {
        x: currentX,
        y: startY,
        size: 8,
        font: helveticaFont,
      });
      currentX += 120;

      // Month values
      for (const month of MONTHS) {
        const monthData = entry.months[month.toLowerCase()];
        if (monthData) {
          if (monthData.projected !== undefined) {
            page.drawText(monthData.projected.toFixed(2), {
              x: currentX,
              y: startY,
              size: 8,
              font: helveticaFont,
              color: rgb(0, 0.5, 0), // Green for projected
            });
          }

          if (monthData.actual !== undefined) {
            page.drawText(monthData.actual.toFixed(2), {
              x: currentX,
              y: startY - 12,
              size: 8,
              font: helveticaFont,
              color: rgb(0, 0, 0), // Purple for credits
            });
          }
        }
        currentX += columnWidth;
      }

      // Year totals
      page.drawText(entry.yearTotal.projected.toFixed(2), {
        x: currentX,
        y: startY,
        size: 8,
        font: helveticaFont,
        color: rgb(0, 0.5, 0), // Green for projected
      });

      page.drawText(entry.yearTotal.actual.toFixed(2), {
        x: currentX,
        y: startY - 12,
        size: 8,
        font: helveticaFont,
      });

      // Move to next row
      startY -= rowHeight;

      // Add a new page if we're running out of space
      if (startY < 50) {
        const newPage = pdfDoc.addPage([842, 595]);
        startY = height - 50;
      }
    }

    // Get PDF as bytes
    const pdfBytes = await pdfDoc.save();

    // Return PDF as downloadable file
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cash-flow-report-${year}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating cash flow PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
