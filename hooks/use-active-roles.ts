import { useState, useCallback, useRef, useEffect } from 'react';
import { RoleData } from '@/lib/types/role';

const API_BASE = '/api/admin/roles/active';

export function useActiveRoles() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const getActiveRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error('Failed to fetch active roles');
      }

      const data = await response.json();
      if (data.roles) {
        if (mountedRef.current) setRoles(data.roles);
        return data.roles;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active roles';
      if (mountedRef.current) setError(errorMessage);
      console.error('Error fetching active roles:', err);
      return [];
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    if (mountedRef.current) setError(null);
  }, []);

  return {
    roles,
    loading,
    error,
    getActiveRoles,
    clearError,
  };
}