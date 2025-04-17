"use client";

import dynamic from 'next/dynamic';

// Dynamically import with no SSR
const CustomCalendarExport = dynamic(
  () => import('./CustomCalendarExport'),
  { ssr: false }
);

export default function CalendarExportPage() {
  return <CustomCalendarExport />;
}
