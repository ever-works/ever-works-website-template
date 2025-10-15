import { Input, Select, SelectItem, Button, Card, CardBody } from '@heroui/react';
import { Search, Filter, X } from 'lucide-react';

interface CompanyFiltersProps {
	searchTerm: string;
	statusFilter: '' | 'active' | 'inactive';
	onSearchChange: (value: string) => void;
	onStatusChange: (value: '' | 'active' | 'inactive') => void;
	onClearFilters: () => void;
	activeFilterCount: number;
	isSearching: boolean;
}

/**
 * Company Filters Component
 * Provides search and filter controls for companies
 */
export function CompanyFilters({
	searchTerm,
	statusFilter,
	onSearchChange,
	onStatusChange,
	onClearFilters,
	activeFilterCount,
	isSearching,
}: CompanyFiltersProps) {
	// const t = useTranslations('admin.ADMIN_COMPANIES_PAGE');

	const statuses = [
		{ key: 'all', label: 'All Status' },
		{ key: 'active', label: 'Active' },
		{ key: 'inactive', label: 'Inactive' },
	];

	return (
		<Card className="mb-6 border-0 shadow-lg">
			<CardBody className="p-6">
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Filter className="w-5 h-5 text-gray-400" />
							<span className="font-medium text-gray-900 dark:text-white">Filters</span>
							{activeFilterCount > 0 && (
								<span className="px-2 py-0.5 text-xs font-medium bg-theme-primary text-white rounded-full">
									{activeFilterCount}
								</span>
							)}
						</div>
						{activeFilterCount > 0 && (
							<Button
								size="sm"
								variant="light"
								color="danger"
								onPress={onClearFilters}
								startContent={<X className="w-4 h-4" />}
							>
								Clear All
							</Button>
						)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Search */}
						<Input
							placeholder="Search by name or domain..."
							value={searchTerm}
							onValueChange={onSearchChange}
							startContent={<Search className="w-4 h-4 text-gray-400" />}
							endContent={
								isSearching && (
									<div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
								)
							}
							isClearable
							onClear={() => onSearchChange('')}
							classNames={{
								input: 'text-sm',
								inputWrapper: 'h-12',
							}}
						/>

						{/* Status Filter */}
						<Select
							placeholder="Filter by status"
							selectedKeys={statusFilter ? [statusFilter] : []}
							onSelectionChange={(keys) => {
								const value = Array.from(keys)[0] as string;
								if (value === 'all') {
									onStatusChange('');
								} else if (value === 'active' || value === 'inactive') {
									onStatusChange(value);
								}
							}}
							classNames={{
								trigger: 'h-12',
							}}
						>
							{statuses.map((status) => (
								<SelectItem key={status.key}>{status.label}</SelectItem>
							))}
						</Select>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
