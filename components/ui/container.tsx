"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "max-7xl" | "none";
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
  "max-7xl": "max-w-[1200px]",
  none: "",
};

export function Container({
  children,
  className,
  maxWidth = "xl",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 md:px-6 !container !mx-auto text-center",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
