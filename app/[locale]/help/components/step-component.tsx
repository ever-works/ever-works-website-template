"use client";

import { ReactNode } from "react";
import { CheckCircle, Circle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProps {
  number: number;
  title: string;
  description?: string;
  children?: ReactNode;
  status?: "pending" | "current" | "completed" | "warning" | "info";
  className?: string;
}

export function Step({ 
  number, 
  title, 
  description, 
  children, 
  status = "pending",
  className 
}: StepProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "current":
        return <Circle className="w-6 h-6 text-theme-primary-500 fill-current" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {number}
            </span>
          </div>
        );
    }
  };

  const getStatusColors = () => {
    switch (status) {
      case "completed":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20";
      case "current":
        return "border-theme-primary-200 dark:border-theme-primary-800 bg-theme-primary-50 dark:bg-theme-primary-900/20 ring-2 ring-theme-primary-500/20";
      case "warning":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20";
      case "info":
        return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20";
      default:
        return "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";
    }
  };

  return (
    <div className={cn(
      "rounded-xl border p-6 transition-all duration-300 hover:shadow-lg",
      getStatusColors(),
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          {description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {description}
            </p>
          )}
          
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StepListProps {
  children: ReactNode;
  className?: string;
}

export function StepList({ children, className }: StepListProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
} 