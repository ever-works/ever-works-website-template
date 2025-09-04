import { useState, useCallback } from 'react';
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
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
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
                  value={localFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <SelectItem key="active">Active</SelectItem>
                  <SelectItem key="inactive">Inactive</SelectItem>
                  <SelectItem key="suspended">Suspended</SelectItem>
                  <SelectItem key="trial">Trial</SelectItem>
                </Select>

                <Select
                  label="Plan"
                  placeholder="All Plans"
                  value={localFilters.plan || ''}
                  onChange={(e) => handleFilterChange('plan', e.target.value)}
                >
                  <SelectItem key="free">Free</SelectItem>
                  <SelectItem key="standard">Standard</SelectItem>
                  <SelectItem key="premium">Premium</SelectItem>
                </Select>

                <Select
                  label="Account Type"
                  placeholder="All Types"
                  value={localFilters.accountType || ''}
                  onChange={(e) => handleFilterChange('accountType', e.target.value)}
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
                  value={localFilters.provider || ''}
                  onChange={(e) => handleFilterChange('provider', e.target.value)}
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
                  value={localFilters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
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
                  value={localFilters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
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
                    value={localFilters.minSubmissions?.toString() || ''}
                    onChange={(e) => handleFilterChange('minSubmissions', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  />
                  <Input
                    label="Max Submissions"
                    type="number"
                    placeholder="100"
                    value={localFilters.maxSubmissions?.toString() || ''}
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
                    value={localFilters.hasAvatar?.toString() || ''}
                    onChange={(e) => handleFilterChange('hasAvatar', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                  >
                    <SelectItem key="">Any</SelectItem>
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>

                  <Select
                    label="Has Website"
                    value={localFilters.hasWebsite?.toString() || ''}
                    onChange={(e) => handleFilterChange('hasWebsite', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                  >
                    <SelectItem key="">Any</SelectItem>
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>

                  <Select
                    label="Has Phone"
                    value={localFilters.hasPhone?.toString() || ''}
                    onChange={(e) => handleFilterChange('hasPhone', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                  >
                    <SelectItem key="">Any</SelectItem>
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>

                  <Select
                    label="Email Verified"
                    value={localFilters.emailVerified?.toString() || ''}
                    onChange={(e) => handleFilterChange('emailVerified', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                  >
                    <SelectItem key="">Any</SelectItem>
                    <SelectItem key="true">Yes</SelectItem>
                    <SelectItem key="false">No</SelectItem>
                  </Select>

                  <Select
                    label="2FA Enabled"
                    value={localFilters.twoFactorEnabled?.toString() || ''}
                    onChange={(e) => handleFilterChange('twoFactorEnabled', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
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
