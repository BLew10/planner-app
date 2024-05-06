import Dashboard from "./Dashboard";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import LoadingSpinner from "../(components)/general/LoadingSpinner";
export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Dashboard />
    </Suspense>
  );
}
