"use client";
import React, { Suspense } from "react";
import LoadingSpinner from "@/app/(components)/general/LoadingSpinner";
import PaymentsPage from "./PaymentsPage";

const Page = () => {
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentsPage />
    </Suspense>
  );
};

export default Page;
