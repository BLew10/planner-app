"use client";

import { CustomizableLayout } from "@/components/customizable-layout";
import { useParams } from "next/navigation";

export default function EditLayoutPage() {
  const params = useParams();
  const layoutId = params.id as string;

  return <CustomizableLayout layoutId={layoutId} />;
} 