import { Input, Button, Card, CardBody } from '@heroui/react';
import * as Select from '@radix-ui/react-select';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { SponsorAdStatus } from '@/lib/types/sponsor-ad';

interface SponsorFiltersProps {
	searchTerm: string;
	statusFilter: SponsorAdStatus | undefined;
	onSearchChange: (value: string) => void;
	onStatusChange: (value: SponsorAdStatus | undefined) => void;
	onClearFilters: () => void;
	activeFilterCount: number;
	isSearching: boolean;
}

const FILTER_CARD = 'mb-6 border-0 shadow-lg';
const FILTER_CARD_BODY = 'p-6';
const SELECT_TRIGGER = cn(
	'flex h-12 w-full items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm',
	'focus:outline-none focus:ring-2 focus:ring-theme-primary-500',
	'disabled:cursor-not-allowed disabled:opacity-50'
);
const SELECT_CONTENT = 'overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50';
const SELECT_ITEM = 'relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 outline-none data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700';

/**
 * Sponsor Filters Component
 * Provides search and filter controls for sponsor ads
 */
export function SponsorFilters({
	searchTerm,
	statusFilter,
	onSearchChange,
	onStatusChange,
	onClearFilters,
	activeFilterCount,
	isSearching,
}: SponsorFiltersProps) {
	const t = useTranslations('admin.SPONSORSHIPS');

	const statuses: Array<{ key: string; label: string }> = [
		{ key: 'all', label: t('ALL_STATUSES') },
		{ key: 'pending_payment', label: t('STATUS_PENDING_PAYMENT') },
		{ key: 'pending', label: t('STATUS_PENDING') },
		{ key: 'active', label: t('STATUS_ACTIVE') },
		{ key: 'rejected', label: t('STATUS_REJECTED') },
		{ key: 'expired', label: t('STATUS_EXPIRED') },
		{ key: 'cancelled', label: t('STATUS_CANCELLED') },
	];

	return (
		<Card className={FILTER_CARD}>
			<CardBody className={FILTER_CARD_BODY}>
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
							placeholder={t('SEARCH_PLACEHOLDER')}
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
									onStatusChange(undefined);
								} else {
									onStatusChange(value as SponsorAdStatus);
								}
							}}
						>
							<Select.Trigger className={SELECT_TRIGGER}>
								<Select.Value placeholder={t('FILTER_BY_STATUS')} />
								<Select.Icon>
									<ChevronDown className="h-4 w-4 opacity-50" />
								</Select.Icon>
							</Select.Trigger>
							<Select.Portal>
								<Select.Content
									className={SELECT_CONTENT}
									position="popper"
									sideOffset={4}
								>
									<Select.Viewport className="p-1">
										{statuses.map((status) => (
											<Select.Item
												key={status.key}
												value={status.key}
												className={SELECT_ITEM}
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
