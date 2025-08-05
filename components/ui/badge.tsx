import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
  secondary: "border-transparent bg-gray-500 text-white hover:bg-gray-600",
  destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
  outline: "text-gray-700 border-gray-300 bg-transparent hover:bg-gray-50",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
