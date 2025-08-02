'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleData } from '@/lib/types/role';

interface DeleteRoleDialogProps {
  role: RoleData;
  onConfirm: (hardDelete: boolean) => void;
  onCancel: () => void;
}

export function DeleteRoleDialog({ role, onConfirm, onCancel }: DeleteRoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [hardDelete, setHardDelete] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(hardDelete);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Delete Role</CardTitle>
              <CardDescription>
                Are you sure you want to delete this role?
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">{role.name}</h4>
            <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">ID:</span> {role.id}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Permissions:</span> {role.permissions.length}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Status:</span>{' '}
              <span className={role.isActive ? 'text-green-600' : 'text-red-600'}>
                {role.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hardDelete"
                checked={hardDelete}
                onChange={(e) => setHardDelete(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="hardDelete" className="text-sm">
                Permanently delete (cannot be undone)
              </label>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {hardDelete ? (
                <p className="text-red-600 dark:text-red-400">
                  ⚠️ This will permanently delete the role and all associated data. This action cannot be undone.
                </p>
              ) : (
                <p>
                  The role will be marked as inactive and can be restored later.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                'Deleting...'
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {hardDelete ? 'Permanently Delete' : 'Delete Role'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
} 