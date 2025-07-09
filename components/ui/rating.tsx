"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function Rating({
  value = 5,
  onChange,
  readOnly = false,
  size = "md",
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverValue(index + 1);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    onChange(index + 1);
  };

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(5)].map((_, index) => {
        const isFilled = index < displayValue;
        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              "cursor-pointer transition-colors",
              isFilled
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 dark:text-gray-600",
              !readOnly &&
                "hover:text-yellow-400 hover:fill-yellow-400"
            )}
            onMouseEnter={() => handleMouseEnter(index)}
            onClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  );
} 