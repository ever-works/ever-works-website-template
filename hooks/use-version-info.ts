import { useState, useEffect, useCallback } from "react";
import { VersionInfo } from "@/app/api/version/route";

interface UseVersionInfoOptions {
  refreshInterval?: number;
  retryOnError?: boolean;
  retryDelay?: number;
}

interface UseVersionInfoReturn {
  versionInfo: VersionInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastFetch: number | null;
}

export function useVersionInfo({
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  retryOnError = true,
  retryDelay = 10000, // 10 seconds
}: UseVersionInfoOptions = {}): UseVersionInfoReturn {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const fetchVersionInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/version", {
        cache: "no-store", // Ensure fresh data
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setVersionInfo(data);
      setLastFetch(Date.now());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching version info:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchVersionInfo();
  }, [fetchVersionInfo]);

  useEffect(() => {
    fetchVersionInfo();
  }, [fetchVersionInfo]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchVersionInfo, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchVersionInfo, refreshInterval]);

  // Retry on error
  useEffect(() => {
    if (error && retryOnError) {
      const timeout = setTimeout(() => {
        fetchVersionInfo();
      }, retryDelay);
      return () => clearTimeout(timeout);
    }
  }, [error, retryOnError, retryDelay, fetchVersionInfo]);

  // Listen for window focus to refetch (helps with ISR updates)
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        fetchVersionInfo();
      }
    };

    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchVersionInfo]);

  return {
    versionInfo,
    loading,
    error,
    refetch,
    lastFetch,
  };
} 