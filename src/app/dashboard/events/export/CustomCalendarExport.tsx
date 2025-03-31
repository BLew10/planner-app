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
import { FileDown, Loader, Loader2 } from "lucide-react";
import { getAllCalendars } from "@/lib/data/calendarEdition";
import { CalendarEdition } from "@prisma/client";

const CustomCalendarExport = () => {
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
    const calendarDays = [];

    try {
      for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push({ day: "", events: [] });
      }

      // Add days of the month with their events
      for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents =
          events?.filter((event) => {
            if (!event.date) return false;

            const [eventMonth, eventDay] = event.date.split("-").map(Number);

            // Check for yearly events
            if (
              event.isYearly &&
              eventMonth - 1 === month &&
              eventDay === day
            ) {
              return true;
            }

            // Check for one-time events
            if (
              !event.isYearly &&
              event.year === year &&
              eventMonth - 1 === month &&
              eventDay === day
            ) {
              return true;
            }

            return false;
          }) || [];

        calendarDays.push({ day, events: dayEvents });
      }

      return calendarDays;
    } catch (error) {
      console.error("Error generating calendar data:", error);
      return [];
    }
  };

  const exportPDF = async () => {
    const yearNum = parseInt(selectedYear);
    const tempDiv = document.createElement("div");
    // Basic container class, specific styles will be added per page
    tempDiv.className = "calendar-export-container-base";
    document.body.appendChild(tempDiv);

    const opt = {
      margin: 0,
      filename: `calendar-${selectedYear}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        width: 1056, // Ensure dimensions match page size (11in * 96dpi approx)
        height: 816, // Ensure dimensions match page size (8.5in * 96dpi approx)
        windowWidth: 1056,
        windowHeight: 816,
        useCORS: true, // Might help if external resources are used
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "landscape",
      },
      // Remove explicit pagebreak option - we handle it manually
    };

    // Get the worker instance which manages the PDF generation process
    const worker = html2pdf().set(opt);

    // Define the styles once to reuse
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
    height: 34px; /* Increased height */
    display: flex;
    align-items: center; /* Vertical centering */
    justify-content: center; /* Horizontal centering */
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
    flex: 1; /* Take remaining space */
    border-collapse: collapse;
    table-layout: fixed;
    margin: 0;
    padding: 0;
    height: calc(100% - 34px); /* Subtract header height */
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
    padding: 0;
    position: relative;
    height: calc((100% - 24px) / 5); /* Evenly distribute height across 5 rows */
  }
  .day-number {
    position: absolute;
    top: 2px;
    right: 4px;
    font-weight: bold;
    font-size: 16px;
    margin: 0;
    padding: 0;
    z-index: 2;
  }
  .events-container {
    position: absolute;
    bottom: 4px;
    left: 0;
    right: 0;
    padding: 0 4px;
  }
  .custom-events-list {
    margin: 0;
    padding: 0 0 0 4px;
  }
  .custom-event-item {
    margin: 2px 0;
    padding: 0;
    font-size: 11px;
    line-height: 1.2;
    text-align: left;
    display: flex;
    align-items: center;
  }
  .bullet {
    display: inline-block;
    width: 10px;
    margin-right: 4px;
    text-align: center;
  }
  .split-events-container {
    position: absolute;
    bottom: 4px; /* Reduced bottom space */
    left: 0;
    right: 0;
    padding: 0 4px;
    max-height: calc(50% - 18px); /* Limit height to prevent overflow */
  }
  .split-custom-event-item {
    font-size: 9px;
    margin: 0; /* Remove margin to save space */
    line-height: 1.1; /* Tighter line height */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%; /* Ensure text truncates rather than wraps */
  }
  .split-day-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .split-day-top {
    border-bottom: 1px solid #ddd;
    position: relative;
    height: 50%;
    padding: 0;
    box-sizing: border-box; /* Ensure padding is included in height */
  }
  .split-day-bottom {
    position: relative;
    height: 50%;
    padding: 0;
    box-sizing: border-box; /* Ensure padding is included in height */
  }
  .split-day-number {
    position: absolute;
    font-size: 14px;
    top: 1px;
    right: 3px;
    font-weight: bold;
  }
  /* Fix for the last row specifically */
  tr:last-child .split-day-container {
    height: 100%;
  }
  
  tr:last-child .split-day-top,
  tr:last-child .split-day-bottom {
    overflow: visible; /* Prevent clipping in the last row */
  }
  </style>
    `;

    for (let m = 0; m < 12; m++) {
      const calendarData = generateCalendarData(yearNum, m);
      const monthHtml = renderCalendarMonth(yearNum, m, calendarData);

      // Set the content for the current month ONLY, wrapped in a container with correct dimensions
      // Add the base class here for styling the container itself
      tempDiv.className = "calendar-export-container";
      tempDiv.innerHTML = `
          ${styles}
          ${monthHtml}
      `;

      // Add the current div content to the PDF object
      // This renders the content and appends it to the internal PDF structure
      await worker.from(tempDiv).toContainer().toCanvas().toPdf();

      // Add a new page for the next month, unless it's the last one
      if (m < 11) {
        // Access the jsPDF instance managed by the worker and add a page
        await worker.get("pdf").then((pdf: any) => {
          // Use 'any' or define a type for the jsPDF instance if available
          pdf.addPage();
        });
      }
    }

    await worker.save();

    // Clean up
    document.body.removeChild(tempDiv);
    setIsExporting(false);
  };

  const renderCalendarMonth = (
    year: number,
    month: number,
    calendarData: any[]
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

    // Get the selected edition name
    const selectedEditionObj = calendarEditions.find(
      (ed) => ed.id === calendarEdition
    );
    const editionName = selectedEditionObj
      ? `${selectedEditionObj.name}`
      : "Community Calendar";

    // Debug log

    const monthContent = `
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
            ${renderCalendarRows(calendarData, month)}
          </tbody>
        </table>
      </div>
    `;

    return monthContent;
  };

  const renderCalendarRows = (calendarData: any[], month: number) => {
    let html = "";
    const rows = Math.ceil(calendarData.length / 7);

    // If we need 6 rows, we'll compress to 5
    const needsCompression = rows > 5;

    // For normal 5 or fewer row calendars
    if (!needsCompression) {
      for (let i = 0; i < calendarData.length; i += 7) {
        html += "<tr>";
        for (let j = 0; j < 7; j++) {
          const dayData = calendarData[i + j];
          if (!dayData) {
            html += '<td class="calendar-day"></td>';
          } else {
            html += `
              <td class="calendar-day">
                ${
                  dayData.day
                    ? `<div class="day-number">${dayData.day}</div>`
                    : ""
                }
                ${
                  dayData.events && dayData.events.length > 0
                    ? `
                  <div class="events-container">
                    <div class="custom-events-list">
                      ${[...dayData.events, ...dayData.events]
                        .map(
                          (event: any) => `
                        <div class="custom-event-item"><span class="bullet">•</span> ${
                          event.name || ""
                        }</div>
                      `
                        )
                        .join("")}
                    </div>
                  </div>
                `
                    : ""
                }
              </td>
            `;
          }
        }
        html += "</tr>";
      }
      return html;
    }

    // For 6-row calendars that need compression
    // We'll do 4 normal rows and then the last row will contain split cells
    for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
      html += "<tr>";
      for (let j = 0; j < 7; j++) {
        const dataIndex = rowIndex * 7 + j;
        const dayData = calendarData[dataIndex];
        if (!dayData) {
          html += '<td class="calendar-day"></td>';
        } else {
          html += `
            <td class="calendar-day">
              ${
                dayData.day
                  ? `<div class="day-number">${dayData.day}</div>`
                  : ""
              }
              ${
                dayData.events && dayData.events.length > 0
                  ? `
                <div class="events-container">
                  <div class="custom-events-list">
                    ${dayData.events
                      .map(
                        (event: any) => `
                      <div class="custom-event-item"><span class="bullet">•</span> ${
                        event.name || ""
                      }</div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              `
                  : ""
              }
            </td>
          `;
        }
      }
      html += "</tr>";
    }

    // Last row with split cells - only changing the event rendering part
    html += "<tr>";
    for (let j = 0; j < 7; j++) {
      const topIndex = 4 * 7 + j;
      const bottomIndex = 5 * 7 + j;

      const topDayData = calendarData[topIndex];
      const bottomDayData =
        bottomIndex < calendarData.length ? calendarData[bottomIndex] : null;

      if (!topDayData && !bottomDayData) {
        html += "<td class='calendar-day'></td>";
      } else {
        html += `
          <td class="calendar-day">
            <div class="split-day-container">
              <div class="split-day-top">
                ${
                  topDayData?.day
                    ? `<div class="day-number split-day-number">${topDayData.day}</div>`
                    : ""
                }
                ${
                  topDayData &&
                  topDayData.events &&
                  topDayData.events.length > 0
                    ? `
                       <div class="events-container">
                  <div class="custom-events-list">
                    <div class="custom-event-item"><span class="bullet">•</span> ${
                      topDayData.events[0]?.name || "test"
                    }</div>
                   </div>
                   </div>
                   `
                    : ""
                }
              </div>
              ${
                bottomDayData
                  ? `<div class="split-day-bottom">
                    ${
                      bottomDayData.day
                        ? `<div class="day-number split-day-number">${bottomDayData.day}</div>`
                        : ""
                    }
                    ${
                      bottomDayData.events && bottomDayData.events.length > 0
                        ? `<div class="events-container">
                  <div class="custom-events-list">
                    <div class="custom-event-item"><span class="bullet">•</span> ${
                      bottomDayData.events[0]?.name || "test"
                    }</div>
                   </div>
                   </div>
                   `
                        : ""
                    }
                  </div>`
                  : ""
              }
            </div>
          </td>`;
      }
    }
    html += "</tr>";

    return html;
  };

  // Only updating the split cell and event styles
  const styles = `
    <style>
    /* Reset all flexbox and complex positioning for split cells */
    .split-day-container {
      position: relative;
      height: 100%;
      width: 100%;
    }
    
    .split-day-top {
      border-bottom: 1px solid #ddd;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
    }
    
    .split-day-bottom {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      bottom: 0;
      height: 50%;
    }
    
    .split-day-number {
      position: absolute;
      font-size: 12px;
      top: 1px;
      right: 3px;
      font-weight: bold;
    }
    
    /* New direct event rendering approach for split cells */
    .split-event-line {
      position: absolute;
      bottom: 2px;
      left: 4px;
      right: 4px;
      font-size: 9px;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
      padding: 0;
      margin: 0;
    }
    </style>
  `;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Custom Calendar Export</CardTitle>
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
