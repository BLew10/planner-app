"use client";

import React, { Suspense } from "react";
import LoadingSpinner from "@/app/(components)/general/LoadingSpinner";
import PurchasesPage from "./PurchasesPage";

const Page = () => {

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PurchasesPage />
    </Suspense>
  );
};

export default Page;
