import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/api-client';
import { Permission } from '@/lib/permissions/definitions';

interface RolePermissionsResponse {
  success: boolean;
  permissions: Permission[];
  role: {
    id: string;
    name: string;
    description: string;
  };
  error?: string;
}

interface UpdatePermissionsResponse {
  success: boolean;
  message: string;
  role: {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
  };
  error?: string;
}

interface UpdatePermissionsRequest {
  permissions: Permission[];
}

// Fetch role permissions
const fetchRolePermissions = async (roleId: string): Promise<RolePermissionsResponse> => {
  const response = await apiClient.get<RolePermissionsResponse>(`/api/admin/roles/${roleId}/permissions`);
  return response;
};

// Update role permissions
const updateRolePermissions = async (
  roleId: string,
  data: UpdatePermissionsRequest
): Promise<UpdatePermissionsResponse> => {
  const response = await apiClient.put<UpdatePermissionsResponse>(
    `/api/admin/roles/${roleId}/permissions`,
    data
  );
  return response;
};

// Query keys
const rolePermissionsQueryKeys = {
  all: ['role-permissions'] as const,
  role: (roleId: string) => [...rolePermissionsQueryKeys.all, roleId] as const,
};

export function useRolePermissions(roleId: string) {
  const queryClient = useQueryClient();

  // Query for fetching permissions
  const {
    data: permissionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: rolePermissionsQueryKeys.role(roleId),
    queryFn: () => fetchRolePermissions(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for updating permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: (data: UpdatePermissionsRequest) =>
      updateRolePermissions(roleId, data),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: rolePermissionsQueryKeys.role(roleId)
      });
      queryClient.invalidateQueries({
        queryKey: ['admin-roles']
      });

      toast.success(data.message || 'Permissions updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update permissions: ${error.message}`);
    },
  });

  // Helper functions
  const updatePermissions = async (permissions: Permission[]): Promise<boolean> => {
    try {
      await updatePermissionsMutation.mutateAsync({ permissions });
      return true;
    } catch (error) {
      console.error('Failed to update permissions:', error);
      return false;
    }
  };

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: rolePermissionsQueryKeys.role(roleId)
    });
  };

  return {
    // Data
    permissions: permissionsData?.permissions || [],
    role: permissionsData?.role,

    // Loading states
    isLoading,
    isUpdating: updatePermissionsMutation.isPending,

    // Error states
    error,

    // Actions
    updatePermissions,
    refetch,
    invalidateCache,
  };
}