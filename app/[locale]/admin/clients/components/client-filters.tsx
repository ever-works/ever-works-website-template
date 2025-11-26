import { Button, Chip, Modal, ModalContent, useDisclosure } from '@heroui/react';
import { Select, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { DatePreset, DateFilterType } from '../hooks/use-client-filters';

interface ClientFiltersProps {
	// Filter values
	searchTerm: string;
	statusFilter: string;
	planFilter: string;
	accountTypeFilter: string;
	providerFilter: string;
	datePreset: DatePreset;
	customDateFrom: string;
	customDateTo: string;
	dateFilterType: DateFilterType;

	// Filter setters
	onSearchChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onPlanChange: (value: string) => void;
	onAccountTypeChange: (value: string) => void;
	onProviderChange: (value: string) => void;
	onDatePresetChange: (value: DatePreset) => void;
	onCustomDateFromChange: (value: string) => void;
	onCustomDateToChange: (value: string) => void;
	onDateFilterTypeChange: (value: DateFilterType) => void;
	onClearFilters: () => void;

	// UI state
	activeFilterCount: number;
	isSearching?: boolean;
}

const SEARCH_INPUT_CLASSES =
	'w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400';

/**
 * Client Filters Component
 * Handles all filter UI and interactions
 * Following SRP: Only responsible for filter UI
 */
export function ClientFilters(props: ClientFiltersProps) {
	const t = useTranslations('admin.ADMIN_CLIENTS_PAGE');
	const { isOpen: isFilterModalOpen, onOpen: onOpenFilterModal, onClose: onCloseFilterModal } = useDisclosure();

	return (
		<div className="mb-6">
			{/* Search Bar */}
			<div className="relative mb-4">
				<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
				<input
					type="text"
					placeholder={t('SEARCH_PLACEHOLDER')}
					value={props.searchTerm}
					onChange={(e) => props.onSearchChange(e.target.value)}
					aria-label={t('SEARCH_PLACEHOLDER')}
					className={SEARCH_INPUT_CLASSES}
				/>
				{props.isSearching && (
					<div className="absolute right-4 top-1/2 transform -translate-y-1/2">
						<LoadingSpinner size="sm" />
					</div>
				)}
			</div>

			{/* Filter Button and Active Filters */}
			<div className="flex items-center justify-between mb-4">
				<Button
					size="sm"
					variant="flat"
					color="secondary"
					startContent={<Filter className="w-4 h-4" />}
					onPress={onOpenFilterModal}
				>
					{t('FILTERS')}
					{props.activeFilterCount > 0 && (
						<Chip size="sm" variant="flat" color="primary" className="ml-2">
							{props.activeFilterCount}
						</Chip>
					)}
				</Button>

				{props.activeFilterCount > 0 && (
					<Button size="sm" variant="light" color="danger" onPress={props.onClearFilters}>
						{t('CLEAR_ALL')}
					</Button>
				)}
			</div>

			{/* Active Filters Display */}
			{props.activeFilterCount > 0 && (
				<div className="flex flex-wrap gap-2 mb-4">
					{props.searchTerm && (
						<Chip variant="flat" color="primary" onClose={() => props.onSearchChange('')}>
							{t('SEARCH')} &ldquo;{props.searchTerm}&rdquo;
						</Chip>
					)}
					{props.statusFilter && (
						<Chip variant="flat" color="secondary" onClose={() => props.onStatusChange('')}>
							{t('STATUS_FILTER')} {props.statusFilter}
						</Chip>
					)}
					{props.planFilter && (
						<Chip variant="flat" color="success" onClose={() => props.onPlanChange('')}>
							{t('PLAN_FILTER')} {props.planFilter}
						</Chip>
					)}
					{props.accountTypeFilter && (
						<Chip variant="flat" color="warning" onClose={() => props.onAccountTypeChange('')}>
							{t('TYPE_FILTER')} {props.accountTypeFilter}
						</Chip>
					)}
					{props.providerFilter && (
						<Chip variant="flat" color="default" onClose={() => props.onProviderChange('')}>
							{t('PROVIDER_FILTER')} {props.providerFilter}
						</Chip>
					)}
					{props.datePreset !== 'all' && (
						<Chip
							variant="flat"
							color="secondary"
							onClose={() => {
								props.onDatePresetChange('all');
								props.onCustomDateFromChange('');
								props.onCustomDateToChange('');
							}}
							className="flex items-center gap-1 max-w-none"
							classNames={{
								base: 'h-auto py-1.5 px-3',
								content: 'flex items-center gap-1.5 text-sm font-medium whitespace-nowrap',
								closeButton: 'ml-2',
							}}
						>
							<Calendar className="w-3.5 h-3.5 shrink-0" />
							<span className="truncate">
								{props.datePreset === 'last7' && t('LAST_7_DAYS_SHORT')}
								{props.datePreset === 'last30' && t('LAST_30_DAYS_SHORT')}
								{props.datePreset === 'last90' && t('LAST_90_DAYS_SHORT')}
								{props.datePreset === 'thisMonth' && t('THIS_MONTH_SHORT')}
								{props.datePreset === 'custom' &&
									`${props.customDateFrom || '...'} to ${props.customDateTo || '...'}`}
								<span className="text-xs opacity-75 ml-1">({props.dateFilterType})</span>
							</span>
						</Chip>
					)}
				</div>
			)}

			{/* Filter Modal */}
			<FilterModal
				isOpen={isFilterModalOpen}
				onClose={onCloseFilterModal}
				statusFilter={props.statusFilter}
				planFilter={props.planFilter}
				accountTypeFilter={props.accountTypeFilter}
				providerFilter={props.providerFilter}
				datePreset={props.datePreset}
				customDateFrom={props.customDateFrom}
				customDateTo={props.customDateTo}
				dateFilterType={props.dateFilterType}
				onStatusChange={props.onStatusChange}
				onPlanChange={props.onPlanChange}
				onAccountTypeChange={props.onAccountTypeChange}
				onProviderChange={props.onProviderChange}
				onDatePresetChange={props.onDatePresetChange}
				onCustomDateFromChange={props.onCustomDateFromChange}
				onCustomDateToChange={props.onCustomDateToChange}
				onDateFilterTypeChange={props.onDateFilterTypeChange}
				onClearFilters={props.onClearFilters}
			/>
		</div>
	);
}

interface FilterModalProps {
	isOpen: boolean;
	onClose: () => void;
	statusFilter: string;
	planFilter: string;
	accountTypeFilter: string;
	providerFilter: string;
	datePreset: DatePreset;
	customDateFrom: string;
	customDateTo: string;
	dateFilterType: DateFilterType;
	onStatusChange: (value: string) => void;
	onPlanChange: (value: string) => void;
	onAccountTypeChange: (value: string) => void;
	onProviderChange: (value: string) => void;
	onDatePresetChange: (value: DatePreset) => void;
	onCustomDateFromChange: (value: string) => void;
	onCustomDateToChange: (value: string) => void;
	onDateFilterTypeChange: (value: DateFilterType) => void;
	onClearFilters: () => void;
}

function FilterModal(props: FilterModalProps) {
	const t = useTranslations('admin.ADMIN_CLIENTS_PAGE');

	return (
		<Modal isOpen={props.isOpen} onClose={props.onClose} size="2xl">
			<ModalContent>
				<div className="relative overflow-visible">
					{/* Background Pattern */}
					<div className="absolute inset-0 bg-linear-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
					<div
						className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
						style={{
							backgroundImage:
								"url('data:image/svg+xml,%3Csvg width=&apos;40&apos; height=&apos;40&apos; viewBox=&apos;0 0 40 40&apos; xmlns=&apos;http://www.w3.org/2000/svg&apos;%3E%3Cg fill=&apos;%23000000&apos; fill-opacity=&apos;0.05&apos; fill-rule=&apos;evenodd&apos;%3E%3Cpath d=&apos;M0 0h40v40H0V0zm1 1h38v38H1V1z&apos; /%3E%3C/g%3E%3C/svg%3E')",
						}}
					/>

					{/* Header */}
					<div className="relative z-10 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-linear-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-linear-to-br from-theme-primary to-theme-accent rounded-lg flex items-center justify-center shadow-lg">
								<Filter className="w-4 h-4 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('FILTER_CLIENTS')}</h2>
								<p className="text-sm text-gray-600 dark:text-gray-400">{t('FILTER_SUBTITLE')}</p>
							</div>
						</div>
					</div>

					{/* Body */}
					<div className="relative z-10 px-6 py-6">
						<div className="space-y-8">
							{/* Basic Filters */}
							<div className="space-y-4 relative z-20">
								<div className="flex items-center space-x-2">
									<div className="w-1 h-6 bg-linear-to-b from-theme-primary to-theme-accent rounded-full"></div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('BASIC_FILTERS')}</h3>
								</div>
								<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xs rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-xs">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
										<div className="space-y-2">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('STATUS')}</span>
											<Select
												placeholder={t('ALL_STATUSES')}
												selectedKeys={props.statusFilter ? [props.statusFilter] : []}
												onSelectionChange={(keys) => props.onStatusChange(Array.from(keys)[0] as string || '')}
												className="w-full"
												classNames={{
													trigger:
														'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary',
												}}
											>
												<SelectItem key="" value="">
													{t('ALL_STATUSES')}
												</SelectItem>
												<SelectItem key="active" value="active">
													{t('ACTIVE')}
												</SelectItem>
												<SelectItem key="inactive" value="inactive">
													{t('INACTIVE')}
												</SelectItem>
												<SelectItem key="suspended" value="suspended">
													{t('SUSPENDED')}
												</SelectItem>
												<SelectItem key="trial" value="trial">
													{t('TRIAL')}
												</SelectItem>
											</Select>
										</div>

										<div className="space-y-2">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('PLAN')}</span>
											<Select
												placeholder={t('ALL_PLANS')}
												selectedKeys={props.planFilter ? [props.planFilter] : []}
												onSelectionChange={(keys) => props.onPlanChange(Array.from(keys)[0] as string || '')}
												className="w-full"
												classNames={{
													trigger:
														'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary',
												}}
											>
												<SelectItem key="free" value="free">
													{t('FREE')}
												</SelectItem>
												<SelectItem key="standard" value="standard">
													{t('STANDARD')}
												</SelectItem>
												<SelectItem key="premium" value="premium">
													{t('PREMIUM')}
												</SelectItem>
											</Select>
										</div>

										<div className="space-y-2">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('ACCOUNT_TYPE')}</span>
											<Select
												placeholder={t('ALL_TYPES')}
												selectedKeys={props.accountTypeFilter ? [props.accountTypeFilter] : []}
												onSelectionChange={(keys) => props.onAccountTypeChange(Array.from(keys)[0] as string || '')}
												className="w-full"
												classNames={{
													trigger:
														'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary',
												}}
											>
												<SelectItem key="individual" value="individual">
													{t('INDIVIDUAL')}
												</SelectItem>
												<SelectItem key="business" value="business">
													{t('BUSINESS')}
												</SelectItem>
												<SelectItem key="enterprise" value="enterprise">
													{t('ENTERPRISE')}
												</SelectItem>
											</Select>
										</div>

										<div className="space-y-2 relative z-30">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('PROVIDER')}</span>
											<Select
												placeholder={t('ALL_PROVIDERS')}
												selectedKeys={props.providerFilter ? [props.providerFilter] : []}
												onSelectionChange={(keys) => props.onProviderChange(Array.from(keys)[0] as string || '')}
												className="w-full"
												classNames={{
													trigger:
														'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary',
													popover: 'z-40',
													listbox: 'z-40',
												}}
											>
												<SelectItem key="credentials" value="credentials">
													{t('EMAIL_PASSWORD')}
												</SelectItem>
												<SelectItem key="google" value="google">
													{t('GOOGLE')}
												</SelectItem>
												<SelectItem key="github" value="github">
													{t('GITHUB')}
												</SelectItem>
												<SelectItem key="facebook" value="facebook">
													{t('FACEBOOK')}
												</SelectItem>
												<SelectItem key="twitter" value="twitter">
													{t('TWITTER')}
												</SelectItem>
												<SelectItem key="linkedin" value="linkedin">
													{t('LINKEDIN')}
												</SelectItem>
											</Select>
										</div>
									</div>
								</div>
							</div>

							{/* Date Filters */}
							<DateFilters
								datePreset={props.datePreset}
								customDateFrom={props.customDateFrom}
								customDateTo={props.customDateTo}
								dateFilterType={props.dateFilterType}
								onDatePresetChange={props.onDatePresetChange}
								onCustomDateFromChange={props.onCustomDateFromChange}
								onCustomDateToChange={props.onCustomDateToChange}
								onDateFilterTypeChange={props.onDateFilterTypeChange}
							/>
						</div>
					</div>

					{/* Footer */}
					<div className="relative z-10 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-linear-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
						<div className="flex items-center justify-between">
							<Button
								variant="flat"
								onPress={props.onClearFilters}
								className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
							>
								{t('CLEAR_ALL')}
							</Button>
							<div className="flex space-x-3">
								<Button
									variant="flat"
									onPress={props.onClose}
									className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
								>
									{t('CANCEL')}
								</Button>
								<Button
									color="primary"
									onPress={props.onClose}
									className="bg-linear-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/40 transition-all duration-300 text-white font-medium"
								>
									{t('APPLY_FILTERS')}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}

interface DateFiltersProps {
	datePreset: DatePreset;
	customDateFrom: string;
	customDateTo: string;
	dateFilterType: DateFilterType;
	onDatePresetChange: (value: DatePreset) => void;
	onCustomDateFromChange: (value: string) => void;
	onCustomDateToChange: (value: string) => void;
	onDateFilterTypeChange: (value: DateFilterType) => void;
}

function DateFilters(props: DateFiltersProps) {
	const t = useTranslations('admin.ADMIN_CLIENTS_PAGE');

	const datePresets = [
		{ value: 'all' as const, label: t('ALL_TIME'), icon: '∞' },
		{ value: 'last7' as const, label: t('LAST_7_DAYS'), icon: '7d' },
		{ value: 'last30' as const, label: t('LAST_30_DAYS'), icon: '30d' },
		{ value: 'last90' as const, label: t('LAST_90_DAYS'), icon: '90d' },
		{ value: 'thisMonth' as const, label: t('THIS_MONTH'), icon: '📅' },
		{ value: 'custom' as const, label: t('CUSTOM_RANGE'), icon: '⚙️' },
	];

	return (
		<div className="space-y-4 relative z-10">
			<div className="flex items-center space-x-2">
				<div className="w-1 h-6 bg-linear-to-b from-emerald-500 to-teal-600 rounded-full"></div>
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('DATE_RANGE')}</h3>
				<div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
					{t('QUICK_EASY')}
				</div>
			</div>
			<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xs rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-xs relative z-10">
				{/* Apply To Toggle */}
				<div className="mb-6">
					<span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 block">
						{t('APPLY_DATE_FILTER_TO')}
					</span>
					<div className="flex gap-3">
						<button
							type="button"
							aria-pressed={props.dateFilterType === 'created'}
							onClick={() => props.onDateFilterTypeChange('created')}
							className={cn(
								'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
								props.dateFilterType === 'created'
									? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
									: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
							)}
						>
							<Calendar className="w-4 h-4 inline mr-2" />
							{t('CREATED_DATE')}
						</button>
						<button
							type="button"
							aria-pressed={props.dateFilterType === 'updated'}
							onClick={() => props.onDateFilterTypeChange('updated')}
							className={cn(
								'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
								props.dateFilterType === 'updated'
									? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
									: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
							)}
						>
							<Calendar className="w-4 h-4 inline mr-2" />
							{t('UPDATED_DATE')}
						</button>
					</div>
				</div>

				{/* Quick Presets */}
				<div className="mb-6">
					<span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 block">{t('QUICK_FILTERS')}</span>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
						{datePresets.map((preset) => (
							<button
								type="button"
								key={preset.value}
								onClick={() => props.onDatePresetChange(preset.value)}
								className={cn(
									'p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left',
									'border-2 backdrop-blur-xs relative group overflow-hidden',
									props.datePreset === preset.value
										? cn(
												'border-emerald-500 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30',
												'text-emerald-700 dark:text-emerald-300 shadow-lg shadow-emerald-500/20'
											)
										: 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-600'
								)}
							>
								<div className="flex items-center justify-between">
									<div>
										<div className="text-lg mb-1">{preset.icon}</div>
										<div className="font-semibold">{preset.label}</div>
									</div>
									{props.datePreset === preset.value && (
										<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
									)}
								</div>
								{props.datePreset === preset.value && (
									<div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-teal-500/10 pointer-events-none"></div>
								)}
							</button>
						))}
					</div>
				</div>

				{/* Custom Date Range */}
				{props.datePreset === 'custom' && (
					<div className="space-y-4 p-4 bg-linear-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
						<h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							{t('CUSTOM_DATE_RANGE')}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label htmlFor="custom-from" className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{t('FROM_DATE')}
								</label>
								<div className="relative group">
									<Input
										id="custom-from"
										type="date"
										value={props.customDateFrom}
										onChange={(e) => props.onCustomDateFromChange(e.target.value)}
										className="h-12"
										classNames={{
											base: 'group-hover:scale-[1.01] transition-transform duration-200',
											input: 'text-gray-900 dark:text-white text-sm font-medium bg-transparent',
											inputWrapper: cn(
												'bg-linear-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/30',
												'border-2 border-blue-200/60 dark:border-blue-600/40',
												'hover:border-blue-400/60 dark:hover:border-blue-500/60',
												'focus-within:border-blue-500 dark:focus-within:border-blue-400',
												'focus-within:ring-4 focus-within:ring-blue-500/20',
												'rounded-xl shadow-xs hover:shadow-md transition-all duration-300',
												'backdrop-blur-xs'
											),
										}}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<label htmlFor="custom-to" className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{t('TO_DATE')}
								</label>
								<div className="relative group">
									<Input
										id="custom-to"
										type="date"
										value={props.customDateTo}
										onChange={(e) => props.onCustomDateToChange(e.target.value)}
										className="h-12"
										classNames={{
											base: 'group-hover:scale-[1.01] transition-transform duration-200',
											input: 'text-gray-900 dark:text-white text-sm font-medium bg-transparent',
											inputWrapper: cn(
												'bg-linear-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/30',
												'border-2 border-blue-200/60 dark:border-blue-600/40',
												'hover:border-blue-400/60 dark:hover:border-blue-500/60',
												'focus-within:border-blue-500 dark:focus-within:border-blue-400',
												'focus-within:ring-4 focus-within:ring-blue-500/20',
												'rounded-xl shadow-xs hover:shadow-md transition-all duration-300',
												'backdrop-blur-xs'
											),
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
