import { useState, useEffect, useCallback, useRef } from "react";
import { VersionInfo } from "@/app/api/version/route";

interface UseVersionInfoOptions {
  refreshInterval?: number;
  retryOnError?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

interface UseVersionInfoReturn {
  versionInfo: VersionInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastFetch: number | null;
  retryCount: number;
}

export function useVersionInfo({
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  retryOnError = true,
  retryDelay = 10000, // 10 seconds
  maxRetries = 3,
}: UseVersionInfoOptions = {}): UseVersionInfoReturn {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use refs to track cleanup and prevent stale closures
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized fetch function with proper error handling
  const fetchVersionInfo = useCallback(async (isRetry = false) => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      const response = await fetch("/api/version", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Validate response data
      if (!data.commit || !data.date || !data.author) {
        throw new Error("Invalid version data received");
      }

      setVersionInfo(data);
      setLastFetch(Date.now());
      setRetryCount(0);
      setError(null);

    } catch (err) {
      // Handle AbortError (not a real error)
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching version info:", errorMessage);
      
      setError(errorMessage);
      
      // Retry logic
      if (retryOnError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchVersionInfo(true);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [retryOnError, retryDelay, maxRetries, retryCount]);

  // Public refetch function
  const refetch = useCallback(async () => {
    setRetryCount(0);
    await fetchVersionInfo(false);
  }, [fetchVersionInfo]);

  // Setup visibility change listener for auto-refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !loading) {
        fetchVersionInfo(false);
      }
    };

    const handleFocus = () => {
      if (!loading) {
        fetchVersionInfo(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchVersionInfo, loading]);

  // Setup refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchVersionInfo(false);
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [fetchVersionInfo, refreshInterval]);

  // Initial fetch
  useEffect(() => {
    fetchVersionInfo(false);
  }, [fetchVersionInfo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    versionInfo,
    loading,
    error,
    refetch,
    lastFetch,
    retryCount,
  };
} 