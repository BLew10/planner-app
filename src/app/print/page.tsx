"use client";
import { Suspense } from "react";
import PrintCalendarInventoryPage from "./PrintCalendarInventoryPage";
import LoadingSpinner from "../(components)/general/LoadingSpinner";

export default function Page() {

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PrintCalendarInventoryPage />
    </Suspense>
  );
}
