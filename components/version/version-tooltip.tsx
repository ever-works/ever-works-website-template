"use client";

import { useState } from "react";
import { VersionDisplay } from "./version-display";
import { useVersionInfo } from "@/hooks/use-version-info";

interface VersionTooltipProps {
  children: React.ReactNode;
  className?: string;
}

export function VersionTooltip({ children, className = "" }: VersionTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { versionInfo, loading } = useVersionInfo();

  if (loading || !versionInfo) {
    return <>{children}</>;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 min-w-64">
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-600 transform rotate-45"></div>
            </div>
            
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Data Repository Version
            </div>
            
            <VersionDisplay 
              variant="detailed" 
              showDetails={true}
              className="text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
} 