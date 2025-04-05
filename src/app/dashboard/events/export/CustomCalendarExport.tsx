"use client";

import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEvents } from "@/hooks/event/useEvents";
import { ALL_YEARS, DEFAULT_YEAR } from "@/lib/constants";
import { ArrowLeft, FileDown, Loader, Loader2 } from "lucide-react";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { CalendarEdition } from "@prisma/client";
import { useRouter } from "next/navigation";

// Create a reusable back button component
const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="flex items-center gap-1"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </Button>
  );
};

const CustomCalendarExport = () => {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);
  const [calendarEdition, setCalendarEdition] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [calendarEditions, setCalendarEditions] = useState<
    Partial<CalendarEdition>[]
  >([]);

  // Fetch calendar editions for the dropdown
  useEffect(() => {
    const fetchCalendarEditions = async () => {
      const { data } = await getAllCalendars();
      if (data && data.length > 0) {
        setCalendarEditions(data);
        setCalendarEdition(data[0].id || "");
      }
    };
    fetchCalendarEditions();
  }, []);

  const { events, isLoading } = useEvents({
    itemsPerPage: 1000,
    selectedYear,
    selectedCalendarEdition: calendarEdition,
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const generateCalendarData = (year: number, month: number) => {
    setIsExporting(true);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Calculate if we need split cells
    const totalCells = firstDayOfMonth + daysInMonth;
    const needsSplitCells = totalCells > 35; // 5 rows x 7 days

    const calendarDays = [];

    try {
      // Fill empty cells for days before the 1st of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push({ day: "", events: [] });
      }

      // Fill all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents =
          events?.filter((event) => {
            if (!event.date) return false;

            const [eventMonth, eventDay] = event.date.split("-").map(Number);

            // For multi-day events - only include on start and end dates
            if (event.isMultiDay && event.endDate) {
              const [endMonth, endDay] = event.endDate.split("-").map(Number);

              // Check if this is the start date
              if (eventMonth - 1 === month && eventDay === day) {
                return true;
              }

              // Check if this is the end date
              if (endMonth - 1 === month && endDay === day) {
                return true;
              }

              return false;
            }

            // For single-day events (yearly)
            if (
              event.isYearly &&
              !event.isMultiDay &&
              eventMonth - 1 === month &&
              eventDay === day
            ) {
              return true;
            }

            // For single-day events (one-time)
            if (
              !event.isYearly &&
              !event.isMultiDay &&
              event.year === year &&
              eventMonth - 1 === month &&
              eventDay === day
            ) {
              return true;
            }

            return false;
          }) || [];

        // Add markers for multi-day events
        const eventsWithMarkers = dayEvents.map((event) => {
          if (!event.isMultiDay) return event;

          const [eventMonth, eventDay] =
            event.date?.split("-").map(Number) || [];
          const [endMonth, endDay] = (event.endDate || "")
            .split("-")
            .map(Number);
          const eventObj = { ...event };

          // Use HTML encoding to ensure the colon is properly displayed
          if (eventMonth - 1 === month && eventDay === day) {
            eventObj.name = `Start\u00A0: ${eventObj.name}`; // \u00A0 is a non-breaking space
          }
          // Mark end day
          else if (endMonth - 1 === month && endDay === day) {
            eventObj.name = `End: ${eventObj.name}`; // \u00A0 is a non-breaking space
          }

          return eventObj;
        });

        calendarDays.push({
          day,
          events: eventsWithMarkers,
          // Flag for split cell rendering in the last row if needed
          isSplitCandidate: needsSplitCells && calendarDays.length >= 28,
        });
      }

      return { calendarDays, needsSplitCells };
    } catch (error) {
      console.error("Error generating calendar data:", error);
      return { calendarDays: [], needsSplitCells: false };
    }
  };

  const renderCalendarMonth = (
    year: number,
    month: number,
    calendarData: { calendarDays: any[]; needsSplitCells: boolean }
  ) => {
    const dayHeaders = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const selectedEditionObj = calendarEditions.find(
      (ed) => ed.id === calendarEdition
    );
    const editionName = selectedEditionObj
      ? `${selectedEditionObj.name}`
      : "Community Calendar";

    return `
      <div class="calendar-month">
        <div class="month-header">
          <span class="edition-info">${year} ${editionName}</span>
          <span class="month-title">${months[month]} ${year}</span>
        </div>
        <table class="calendar-grid">
          <thead>
            <tr>
              ${dayHeaders
                .map((day) => `<th class="day-header">${day}</th>`)
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${renderCalendarRows(
              calendarData.calendarDays,
              calendarData.needsSplitCells
            )}
          </tbody>
        </table>
      </div>
    `;
  };

  const renderCalendarRows = (
    calendarDays: any[],
    needsSplitCells: boolean
  ) => {
    let html = "";

    // Calculate how many complete rows we can have
    const completeRows = needsSplitCells ? 4 : 5;

    // Generate the first 4 or 5 rows normally
    for (let rowIndex = 0; rowIndex < completeRows; rowIndex++) {
      const startIndex = rowIndex * 7;

      html += "<tr>";
      for (let j = 0; j < 7; j++) {
        const dayData = calendarDays[startIndex + j];
        if (!dayData) {
          html += '<td class="calendar-day"></td>';
        } else {
          html += `
            <td class="calendar-day">
              <div class="day-number">${dayData.day}</div>
              ${
                dayData.events && dayData.events.length > 0
                  ? `<div class="events-container">
                  <ul class="custom-events-list">
                    ${dayData.events
                      .map(
                        (event: any) =>
                          `<li class="custom-event-item">
                        <span class="bullet">•</span>${event.name || ""}
                      </li>`
                      )
                      .join("")}
                  </ul>
                </div>`
                  : ""
              }
            </td>
          `;
        }
      }
      html += "</tr>";
    }

    // If we need split cells, render the last row with two dates per cell
    if (needsSplitCells) {
      const startIndex = 28; // 4 rows x 7 days

      html += "<tr>";
      for (let j = 0; j < 7; j++) {
        const topDayData = calendarDays[startIndex + j];
        const bottomDayData = calendarDays[startIndex + j + 7];

        html += '<td class="calendar-day split-day">';

        // Render top half
        if (topDayData) {
          html += `
            <div class="split-day-top">
              <div class="split-day-number">${topDayData.day}</div>
              ${
                topDayData.events && topDayData.events.length > 0
                  ? `<div class="split-events-container">
                  <ul class="split-events-list">
                    ${topDayData.events
                      .map(
                        (event: any) =>
                          `<li class="split-event-item">
                        <span class="bullet">•</span>${event.name || ""}
                      </li>`
                      )
                      .join("")}
                  </ul>
                </div>`
                  : ""
              }
            </div>
          `;
        } else {
          html += '<div class="split-day-top"></div>';
        }

        // Render bottom half
        if (bottomDayData) {
          html += `
            <div class="split-day-bottom">
              <div class="split-day-number">${bottomDayData.day}</div>
              ${
                bottomDayData.events && bottomDayData.events.length > 0
                  ? `<div class="split-events-container">
                  <ul class="split-events-list">
                    ${bottomDayData.events
                      .map(
                        (event: any) =>
                          `<li class="split-event-item">
                        <span class="bullet">•</span>${event.name || ""}
                      </li>`
                      )
                      .join("")}
                  </ul>
                </div>`
                  : ""
              }
            </div>
          `;
        } else {
          html += '<div class="split-day-bottom"></div>';
        }

        html += "</td>";
      }
      html += "</tr>";
    }

    return html;
  };

  const exportPDF = async () => {
    const yearNum = parseInt(selectedYear);
    const tempDiv = document.createElement("div");
    tempDiv.className = "calendar-export-container-base";
    document.body.appendChild(tempDiv);

    const opt = {
      margin: 0,
      filename: `calendar-${selectedYear}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        width: 1056,
        height: 816,
        windowWidth: 1056,
        windowHeight: 816,
        useCORS: true,
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "landscape",
      },
    };

    const worker = html2pdf().set(opt);

    // Updated CSS styles
    const styles = `
    <style>
    .calendar-export-container {
      font-family: Arial, sans-serif;
      width: 11in;
      height: 8.5in;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }
    .calendar-month {
      width: 100%;
      height: 100%;
      page-break-after: always;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
    }
    .month-header {
      position: relative;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      color: #333;
      background-color: #c8e6dc;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .edition-info {
      position: absolute;
      left: 10px;
      font-size: 12px;
      font-weight: normal;
      font-style: italic;
    }
    .month-title {
      font-weight: bold;
    }
    .calendar-grid {
      width: 100%;
      flex: 1;
      border-collapse: collapse;
      table-layout: fixed;
      margin: 0;
      padding: 0;
      height: calc(100% - 34px);
    }
    .day-header {
      background-color: #e9e2c0;
      padding: 3px;
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      border: 1px solid #ddd;
      height: 24px;
    }
    .calendar-day {
      border: 1px solid #ddd;
      vertical-align: top;
      width: 14.28%;
      position: relative;
      padding: 0;
    }
    .day-number {
      position: absolute;
      top: 2px;
      right: 5px;
      font-weight: bold;
      font-size: 14px;
      margin: 0;
      padding: 0;
    }
    .events-container {
      position: absolute;
      bottom: 5px;
      left: 0;
      right: 0;
      padding: 2px 4px;
      max-width: 100%;
      box-sizing: border-box;
    }
    .custom-events-list {
      margin: 0;
      padding: 0;
      list-style-type: none;
    }
    .custom-event-item {
      margin: 2px 0;
      padding: 0;
      font-size: 10px;
      line-height: 1.1;
      text-align: left;
      display: flex;
      align-items: flex-start;
      word-wrap: break-word;
      word-break: normal;
      white-space: normal;
      overflow: visible;
    }
    .bullet {
      display: inline-block;
      min-width: 10px;
      margin-right: 3px;
      text-align: center;
      flex-shrink: 0;
    }
    /* Split day styles */
    .split-day {
      padding: 0;
      position: relative;
    }
    .split-day-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      border-bottom: 1px solid #ddd;
    }
    .split-day-bottom {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .split-day-number {
      position: absolute;
      top: 2px;
      right: 5px;
      font-weight: bold;
      font-size: 12px;
      margin: 0;
      padding: 0;
    }
    .split-events-container {
      position: absolute;
      bottom: 2px;
      left: 0;
      right: 0;
      padding: 1px 4px;
      max-width: 100%;
      box-sizing: border-box;
    }
    .split-events-list {
      margin: 0;
      padding: 0;
      list-style-type: none;
    }
    .split-event-item {
      margin: 1px 0;
      padding: 0;
      font-size: 8px;
      line-height: 1.1;
      text-align: left;
      display: flex;
      align-items: flex-start;
      word-wrap: break-word;
      word-break: normal;
      white-space: normal;
      overflow: visible;
    }
    tr {
      height: 20%;
    }
    tr:last-child {
      height: 20%;
    }
    </style>
    `;

    for (let m = 0; m < 12; m++) {
      const calendarData = generateCalendarData(yearNum, m);
      const monthHtml = renderCalendarMonth(yearNum, m, calendarData);

      tempDiv.className = "calendar-export-container";
      tempDiv.innerHTML = `
          ${styles}
          ${monthHtml}
      `;

      await worker.from(tempDiv).toContainer().toCanvas().toPdf();

      if (m < 11) {
        await worker.get("pdf").then((pdf: any) => {
          pdf.addPage();
        });
      }
    }

    await worker.save();
    document.body.removeChild(tempDiv);
    setIsExporting(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <BackButton />
            <CardTitle>Custom Calendar Export</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 mb-4">
            <div className="space-y-2">
              <Label htmlFor="year-select">Calendar Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-select" className="w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_YEARS.map(({ value }) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edition-select">Calendar Edition</Label>
              <Select
                value={calendarEdition}
                onValueChange={setCalendarEdition}
              >
                <SelectTrigger id="edition-select" className="w-[250px]">
                  <SelectValue placeholder="Select calendar edition" />
                </SelectTrigger>
                <SelectContent>
                  {calendarEditions.map((edition) => (
                    <SelectItem key={edition.id} value={edition.id || ""}>
                      {edition.name} ({edition.code || "N/A"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            disabled={isLoading || isExporting}
            onClick={exportPDF}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...
              </div>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" /> Export Calendar as PDF
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default CustomCalendarExport;
