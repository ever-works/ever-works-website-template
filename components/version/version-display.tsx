"use client";

import { Clock, GitBranch, User, Calendar } from "lucide-react";
import { useVersionInfo } from "@/hooks/use-version-info";

interface VersionDisplayProps {
  className?: string;
  variant?: "inline" | "badge" | "detailed";
  showDetails?: boolean;
  refreshInterval?: number;
}

export function VersionDisplay({ 
  className = "", 
  variant = "inline", 
  showDetails = false,
  refreshInterval = 5 * 60 * 1000 // 5 minutes
}: VersionDisplayProps) {
  const { versionInfo, loading, error } = useVersionInfo({
    refreshInterval,
    retryOnError: true,
    retryDelay: 10000,
  });

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    );
  }

  if (error || !versionInfo) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        Data version unavailable
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRepositoryName = (url: string) => {
    if (url === "unknown") return "Unknown";
    const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : url;
  };

  if (variant === "badge") {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400 ${className}`}>
        <GitBranch className="h-3 w-3" />
        <span>Data: {versionInfo.commit}</span>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={`space-y-2 text-sm ${className}`}>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <GitBranch className="h-4 w-4" />
          <span className="font-medium">Data Version:</span>
          <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            {versionInfo.commit}
          </code>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>Updated: {formatDate(versionInfo.date)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <User className="h-4 w-4" />
          <span>By: {versionInfo.author}</span>
        </div>
        
        {showDetails && (
          <>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Last sync: {formatDate(versionInfo.lastSync)}</span>
            </div>
            
            <div className="text-gray-600 dark:text-gray-400">
              <span>Repository: </span>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                {getRepositoryName(versionInfo.repository)}
              </code>
            </div>
            
            {versionInfo.message && (
              <div className="text-gray-600 dark:text-gray-400">
                <span>Message: </span>
                <em className="text-sm">{versionInfo.message}</em>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      <GitBranch className="h-3 w-3" />
      <span>Data: {versionInfo.commit}</span>
      <span className="text-gray-400">•</span>
      <span>{formatDate(versionInfo.date)}</span>
    </div>
  );
} 