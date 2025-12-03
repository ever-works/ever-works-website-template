"use client";

import { ReactNode } from "react";
import { useContainerWidth } from "@/components/ui/container";

export default function LayoutGrid({ children }: { children: ReactNode }) {
  const containerWidth = useContainerWidth();
  const isFluid = containerWidth === "fluid";

  return (
    <div className={`grid justify-items-stretch gap-4 sm:gap-5 lg:gap-6 ${
      isFluid 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
    }`}>
      {children}
    </div>
  );
}
