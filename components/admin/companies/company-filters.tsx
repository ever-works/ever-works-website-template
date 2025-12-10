import { Input, Button, Card, CardBody } from '@heroui/react';
import * as Select from '@radix-ui/react-select';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
						<Select.Root
							value={statusFilter || 'all'}
							onValueChange={(value) => {
								if (value === 'all') {
									onStatusChange('');
								} else if (value === 'active' || value === 'inactive') {
									onStatusChange(value);
								}
							}}
						>
							<Select.Trigger
								className={cn(
									"flex h-12 w-full items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm",
									"focus:outline-none focus:ring-2 focus:ring-theme-primary-500",
									"disabled:cursor-not-allowed disabled:opacity-50"
								)}
							>
								<Select.Value placeholder="Filter by status" />
								<Select.Icon>
									<ChevronDown className="h-4 w-4 opacity-50" />
								</Select.Icon>
							</Select.Trigger>
							<Select.Portal>
								<Select.Content
									className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
									position="popper"
									sideOffset={4}
								>
									<Select.Viewport className="p-1">
										{statuses.map((status) => (
											<Select.Item
												key={status.key}
												value={status.key}
												className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 outline-none data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700"
											>
												<Select.ItemIndicator className="absolute left-2 inline-flex items-center">
													<Check className="h-4 w-4" />
												</Select.ItemIndicator>
												<Select.ItemText>{status.label}</Select.ItemText>
											</Select.Item>
										))}
									</Select.Viewport>
								</Select.Content>
							</Select.Portal>
						</Select.Root>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
