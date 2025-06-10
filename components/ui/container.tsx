"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "max-7xl" | "none";
}


export function Container({
  children,
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 md:px-6 lg:px-8 !max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
