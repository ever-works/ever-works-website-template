import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StickyHeaderProps {
  children: ReactNode;
  className?: string;
  top?: number;
  zIndex?: number;
  withBlur?: boolean;
  withShadow?: boolean;
  withBorder?: boolean;
}

export function StickyHeader({
  children,
  className,
  top = 4,
  zIndex = 10,
  withBlur = true,
  withShadow = true,
  withBorder = false,
}: StickyHeaderProps) {
  return (
    <div
      className={cn(
        "sticky transition-all duration-300",
        `top-${top}`,
        `z-${zIndex}`,
        withBlur && "backdrop-blur-sm",
        withShadow && "shadow-md",
        withBorder && "border-b border-gray-200 dark:border-gray-700",
        "bg-white/95 dark:bg-gray-800/95",
        className
      )}
    >
      {children}
    </div>
  );
} 