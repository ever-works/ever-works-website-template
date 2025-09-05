import { useState, useCallback, useEffect } from 'react';
import { Button, Input, Select, SelectItem, Chip, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { Search, Filter, Calendar, Building2, MapPin, Briefcase, Mail, Hash, Shield } from 'lucide-react';

interface AdvancedSearchFilters {
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
}

interface AdvancedSearchPanelProps {
  filters: AdvancedSearchFilters;
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  onClearFilters: () => void;
}

export function AdvancedSearchPanel({ filters, onFiltersChange, onClearFilters }: AdvancedSearchPanelProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [localFilters, setLocalFilters] = useState<AdvancedSearchFilters>(filters);

  // Sync local state with parent filters when they change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = useCallback((key: keyof AdvancedSearchFilters, value: AdvancedSearchFilters[keyof AdvancedSearchFilters]) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onFiltersChange(localFilters);
    onClose();
  }, [localFilters, onFiltersChange, onClose]);

  const handleResetFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== false
  );

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== false
  ).length;

  return (
    <>
      {/* Advanced Search Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          size="sm"
          variant="flat"
          color="secondary"
          startContent={<Filter className="w-4 h-4" />}
          onPress={onOpen}
        >
          Advanced Search
        </Button>
        
        {hasActiveFilters && (
          <Chip
            variant="flat"
            color="primary"
            startContent={<Search className="w-3 h-3" />}
            onClose={onClearFilters}
          >
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </Chip>
        )}
      </div>

      {/* Advanced Search Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside" onOpenChange={(open) => !open && onClose()}>
        <ModalContent>
          <ModalHeader>Advanced Search & Filters</ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Basic Search */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Basic Search
                </h4>
                <Input
                  label="Global Search"
                  placeholder="Search across all fields..."
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  startContent={<Search className="w-4 h-4 text-gray-400" />}
                />
              </div>

              {/* Status & Plan Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Status"
                  placeholder="All Statuses"
                  selectedKeys={localFilters.status ? new Set([localFilters.status]) : new Set()}
                  onSelectionChange={(keys) => {
                    const k = Array.from(keys as Set<string>)[0];
                    handleFilterChange('status', k ?? '');
                  }}
                >
                  <SelectItem key="active">Active</SelectItem>
                  <SelectItem key="inactive">Inactive</SelectItem>
                  <SelectItem key="suspended">Suspended</SelectItem>
                  <SelectItem key="trial">Trial</SelectItem>
                </Select>

                <Select
                  label="Plan"
                  placeholder="All Plans"
                  selectedKeys={localFilters.plan ? new Set([localFilters.plan]) : new Set()}
                  onSelectionChange={(keys) => {
                    const k = Array.from(keys as Set<string>)[0];
                    handleFilterChange('plan', k ?? '');
                  }}
                >
                  <SelectItem key="free">Free</SelectItem>
                  <SelectItem key="standard">Standard</SelectItem>
                  <SelectItem key="premium">Premium</SelectItem>
                </Select>

                <Select
                  label="Account Type"
                  placeholder="All Types"
                  selectedKeys={localFilters.accountType ? new Set([localFilters.accountType]) : new Set()}
                  onSelectionChange={(keys) => {
                    const k = Array.from(keys as Set<string>)[0];
                    handleFilterChange('accountType', k ?? '');
                  }}
                >
                  <SelectItem key="individual">Individual</SelectItem>
                  <SelectItem key="business">Business</SelectItem>
                  <SelectItem key="enterprise">Enterprise</SelectItem>
                </Select>
              </div>

              {/* Provider & Sorting */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Provider"
                  placeholder="All Providers"
                  selectedKeys={localFilters.provider ? new Set([localFilters.provider]) : new Set()}
                  onSelectionChange={(keys) => {
                    const k = Array.from(keys as Set<string>)[0];
                    handleFilterChange('provider', k ?? '');
                  }}
                >
                  <SelectItem key="credentials">Email/Password</SelectItem>
                  <SelectItem key="google">Google</SelectItem>
                  <SelectItem key="github">GitHub</SelectItem>
                  <SelectItem key="facebook">Facebook</SelectItem>
                  <SelectItem key="twitter">Twitter</SelectItem>
                  <SelectItem key="linkedin">LinkedIn</SelectItem>
                </Select>

                <Select
                  label="Sort By"
                  selectedKeys={new Set([localFilters.sortBy || 'createdAt'])}
                  onSelectionChange={(keys) => {
                    const k = Array.from(keys as Set<string>)[0];
                    handleFilterChange('sortBy', k ?? 'createdAt');
                  }}
                >
                  <SelectItem key="createdAt">Created Date</SelectItem>
                  <SelectItem key="updatedAt">Updated Date</SelectItem>
                  <SelectItem key="name">Name</SelectItem>
                  <SelectItem key="email">Email</SelectItem>
                  <SelectItem key="company">Company</SelectItem>
                  <SelectItem key="totalSubmissions">Submissions</SelectItem>
                </Select>

                <Select
                  label="Sort Order"
                  selectedKeys={new Set([localFilters.sortOrder || 'desc'])}
                  onSelectionChange={(keys) => {
                    const k = Array.from(keys as Set<string>)[0];
                    handleFilterChange('sortOrder', k ?? 'desc');
                  }}
                >
                  <SelectItem key="desc">Descending</SelectItem>
                  <SelectItem key="asc">Ascending</SelectItem>
                </Select>
              </div>

              {/* Date Range Filters */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Filters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Created After"
                    type="date"
                    value={localFilters.createdAfter || ''}
                    onChange={(e) => handleFilterChange('createdAfter', e.target.value)}
                  />
                  <Input
                    label="Created Before"
                    type="date"
                    value={localFilters.createdBefore || ''}
                    onChange={(e) => handleFilterChange('createdBefore', e.target.value)}
                  />
                  <Input
                    label="Updated After"
                    type="date"
                    value={localFilters.updatedAfter || ''}
                    onChange={(e) => handleFilterChange('updatedAfter', e.target.value)}
                  />
                  <Input
                    label="Updated Before"
                    type="date"
                    value={localFilters.updatedBefore || ''}
                    onChange={(e) => handleFilterChange('updatedBefore', e.target.value)}
                  />
                </div>
              </div>

              {/* Field-Specific Searches */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Field-Specific Search
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email Domain"
                    placeholder="e.g., gmail.com"
                    value={localFilters.emailDomain || ''}
                    onChange={(e) => handleFilterChange('emailDomain', e.target.value)}
                    startContent={<Mail className="w-4 h-4 text-gray-400" />}
                  />
                  <Input
                    label="Company"
                    placeholder="Search by company name"
                    value={localFilters.companySearch || ''}
                    onChange={(e) => handleFilterChange('companySearch', e.target.value)}
                    startContent={<Building2 className="w-4 h-4 text-gray-400" />}
                  />
                  <Input
                    label="Location"
                    placeholder="Search by location"
                    value={localFilters.locationSearch || ''}
                    onChange={(e) => handleFilterChange('locationSearch', e.target.value)}
                    startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                  />
                  <Input
                    label="Industry"
                    placeholder="Search by industry"
                    value={localFilters.industrySearch || ''}
                    onChange={(e) => handleFilterChange('industrySearch', e.target.value)}
                    startContent={<Briefcase className="w-4 h-4 text-gray-400" />}
                  />
                </div>
              </div>

              {/* Numeric Filters */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Numeric Filters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Min Submissions"
                    type="number"
                    placeholder="0"
                    value={localFilters.minSubmissions != null ? String(localFilters.minSubmissions) : ''}
                    onChange={(e) => handleFilterChange('minSubmissions', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  />
                  <Input
                    label="Max Submissions"
                    type="number"
                    placeholder="100"
                    value={localFilters.maxSubmissions != null ? String(localFilters.maxSubmissions) : ''}
                    onChange={(e) => handleFilterChange('maxSubmissions', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  />
                </div>
              </div>

              {/* Boolean Filters */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Profile Features
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Select
                    label="Has Avatar"
                    selectedKeys={
                      typeof localFilters.hasAvatar === 'boolean'
                        ? new Set([String(localFilters.hasAvatar)])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys as Set<string>)[0];
                      handleFilterChange('hasAvatar', k === 'true' ? true : k === 'false' ? false : undefined);
                    }}
                  >
                    <SelectItem key="">Any</SelectItem>
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>

                  <Select
                    label="Has Website"
                    selectedKeys={
                      typeof localFilters.hasWebsite === 'boolean'
                        ? new Set([String(localFilters.hasWebsite)])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys as Set<string>)[0];
                      handleFilterChange('hasWebsite', k === 'true' ? true : k === 'false' ? false : undefined);
                    }}
                  >
                    <SelectItem key="">Any</SelectItem>
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>

                  <Select
                    label="Has Phone"
                    selectedKeys={
                      typeof localFilters.hasPhone === 'boolean'
                        ? new Set([String(localFilters.hasPhone)])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys as Set<string>)[0];
                      handleFilterChange('hasPhone', k === 'true' ? true : k === 'false' ? false : undefined);
                    }}
                  >
                    <SelectItem key="">Any</SelectItem>
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>

                  <Select
                    label="Email Verified"
                    selectedKeys={
                      typeof localFilters.emailVerified === 'boolean'
                        ? new Set([String(localFilters.emailVerified)])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys as Set<string>)[0];
                      handleFilterChange('emailVerified', k === 'true' ? true : k === 'false' ? false : undefined);
                    }}
                  >
                    <SelectItem key="">Any</SelectItem>
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>

                  <Select
                    label="2FA Enabled"
                    selectedKeys={
                      typeof localFilters.twoFactorEnabled === 'boolean'
                        ? new Set([String(localFilters.twoFactorEnabled)])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys as Set<string>)[0];
                      handleFilterChange('twoFactorEnabled', k === 'true' ? true : k === 'false' ? false : undefined);
                    }}
                  >
                    <SelectItem key="">Any</SelectItem>
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={handleResetFilters}>
              Reset
            </Button>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleApplyFilters}>
              Apply Filters
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
