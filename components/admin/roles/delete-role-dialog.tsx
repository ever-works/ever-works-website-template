'use client';

import { useState } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Switch } from '@heroui/react';
import { AlertTriangle, Trash2, Shield } from 'lucide-react';
import { RoleData } from '@/lib/types/role';

interface DeleteRoleDialogProps {
  role: RoleData;
  onConfirm: (hardDelete: boolean) => void;
  onCancel: () => void;
}

export function DeleteRoleDialog({ role, onConfirm, onCancel }: DeleteRoleDialogProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hardDelete, setHardDelete] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(hardDelete);
      setIsOpen(false);
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    onCancel();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="md">
      <ModalContent>
        <ModalHeader className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
          </div>
          <span>Delete Role</span>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-accent rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {role.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {role.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>ID: {role.id}</span>
                  <span>{role.permissions.length} permissions</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Warning</p>
                  <p className="mt-1">
                    This action cannot be undone. Deleting this role will remove all associated permissions and may affect users assigned to this role.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  isSelected={hardDelete}
                  onValueChange={setHardDelete}
                  color="danger"
                  size="sm"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Permanently delete (cannot be recovered)
                </label>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={handleCancel}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            variant="flat"
            onPress={handleConfirm}
            isLoading={isLoading}
            startContent={<Trash2 size={16} />}
          >
            {hardDelete ? 'Delete Permanently' : 'Delete Role'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 