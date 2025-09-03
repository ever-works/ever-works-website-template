import { useState, useCallback } from 'react';
import { Button, Card, CardBody, Chip, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem } from '@heroui/react';
import { Save, Filter, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: {
    search?: string;
    status?: string;
    plan?: string;
    accountType?: string;
    provider?: string;
    sortBy?: string;
    sortOrder?: string;
    createdAfter?: string;
    createdBefore?: string;
    updatedAfter?: string;
    updatedBefore?: string;
    emailDomain?: string;
    companySearch?: string;
    locationSearch?: string;
    industrySearch?: string;
    minSubmissions?: number;
    maxSubmissions?: number;
    hasAvatar?: boolean;
    hasWebsite?: boolean;
    hasPhone?: boolean;
    emailVerified?: boolean;
    twoFactorEnabled?: boolean;
  };
  createdAt: Date;
  lastUsed?: Date;
}

interface SavedFiltersProps {
  currentFilters: any;
  onApplyFilter: (filters: any) => void;
  onSaveFilter: (filter: Omit<SavedFilter, 'id' | 'createdAt'>) => void;
  onDeleteFilter: (id: string) => void;
  savedFilters: SavedFilter[];
}

export function SavedFilters({ 
  currentFilters, 
  onApplyFilter, 
  onSaveFilter, 
  onDeleteFilter, 
  savedFilters 
}: SavedFiltersProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  const handleSaveFilter = useCallback(() => {
    if (!filterName.trim()) {
      toast.error('Please provide a name for the filter');
      return;
    }

    const newFilter: Omit<SavedFilter, 'id' | 'createdAt'> = {
      name: filterName.trim(),
      description: filterDescription.trim() || undefined,
      filters: { ...currentFilters },
      lastUsed: new Date()
    };

    onSaveFilter(newFilter);
    setFilterName('');
    setFilterDescription('');
    onClose();
    toast.success('Filter saved successfully');
  }, [filterName, filterDescription, currentFilters, onSaveFilter, onClose]);

  const handleApplyFilter = useCallback((filter: SavedFilter) => {
    onApplyFilter(filter.filters);
    toast.success(`Applied filter: ${filter.name}`);
  }, [onApplyFilter]);

  const handleDeleteFilter = useCallback((id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the filter "${name}"?`)) {
      onDeleteFilter(id);
      toast.success('Filter deleted successfully');
    }
  }, [onDeleteFilter]);

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Button
          size="sm"
          variant="flat"
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={onOpen}
        >
          Save Current Filters
        </Button>
        
        {savedFilters.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Saved:</span>
            {savedFilters.slice(0, 3).map((filter) => (
              <Chip
                key={filter.id}
                variant="flat"
                color="secondary"
                startContent={<Filter className="w-3 h-3" />}
                onPress={() => handleApplyFilter(filter)}
                className="cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800"
              >
                {filter.name}
              </Chip>
            ))}
            {savedFilters.length > 3 && (
              <Chip variant="flat" color="default">
                +{savedFilters.length - 3} more
              </Chip>
            )}
          </div>
        )}
      </div>

      {/* Save Filter Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader>Save Filter Preset</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Filter Name"
                placeholder="e.g., Active Premium Users"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                required
              />
              <Input
                label="Description (optional)"
                placeholder="e.g., High-value active users with premium plans"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
              />
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Filters:</p>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {Object.entries(currentFilters).map(([key, value]) => {
                    if (value && value !== '' && value !== false) {
                      return (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      );
                    }
                    return null;
                  }).filter(Boolean)}
                  {Object.entries(currentFilters).every(([_, value]) => !value || value === '' || value === false) && (
                    <span className="text-gray-500">No active filters</span>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveFilter}>
              Save Filter
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Saved Filters List */}
      {savedFilters.length > 0 && (
        <Card className="mb-6 border-0 shadow-lg">
          <CardBody className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Saved Filter Presets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">{filter.name}</h5>
                      {filter.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{filter.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      isIconOnly
                      onPress={() => handleDeleteFilter(filter.id, filter.name)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {filter.filters.status && <Chip size="sm" variant="flat" color="primary">{filter.filters.status}</Chip>}
                      {filter.filters.plan && <Chip size="sm" variant="flat" color="secondary">{filter.filters.plan}</Chip>}
                      {filter.filters.provider && <Chip size="sm" variant="flat" color="success">{filter.filters.provider}</Chip>}
                    </div>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => handleApplyFilter(filter)}
                    >
                      Apply
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-2">
                    Created: {filter.createdAt.toLocaleDateString()}
                    {filter.lastUsed && ` • Last used: ${filter.lastUsed.toLocaleDateString()}`}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
}
