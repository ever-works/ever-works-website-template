import { useEffect, useState } from 'react';
import { Button, Chip, Spinner } from '@heroui/react';
import {
	Clock,
	Plus,
	Edit2,
	RefreshCw,
	CheckCircle,
	Trash2,
	RotateCcw,
	ChevronDown,
	ChevronUp,
	X
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useItemHistory, type ItemAuditLogEntry } from '@/hooks/use-item-history';
import { ItemAuditAction, type ItemAuditActionValues } from '@/lib/db/schema';
import { UniversalPagination } from '@/components/universal-pagination';
import { cn } from '@/lib/utils';

// ===================== Constants =====================

const MODAL_OVERLAY = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
const MODAL_CONTAINER = 'w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col';
const MODAL_HEADER = 'bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 shrink-0';
const MODAL_BODY = 'p-6 overflow-y-auto flex-1';

const ACTION_CONFIG: Record<
	ItemAuditActionValues,
	{ icon: typeof Clock; color: string; bgColor: string; borderColor: string }
> = {
	[ItemAuditAction.CREATED]: {
		icon: Plus,
		color: 'text-green-600 dark:text-green-400',
		bgColor: 'bg-green-100 dark:bg-green-900/20',
		borderColor: 'border-green-300 dark:border-green-700'
	},
	[ItemAuditAction.UPDATED]: {
		icon: Edit2,
		color: 'text-blue-600 dark:text-blue-400',
		bgColor: 'bg-blue-100 dark:bg-blue-900/20',
		borderColor: 'border-blue-300 dark:border-blue-700'
	},
	[ItemAuditAction.STATUS_CHANGED]: {
		icon: RefreshCw,
		color: 'text-yellow-600 dark:text-yellow-400',
		bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
		borderColor: 'border-yellow-300 dark:border-yellow-700'
	},
	[ItemAuditAction.REVIEWED]: {
		icon: CheckCircle,
		color: 'text-purple-600 dark:text-purple-400',
		bgColor: 'bg-purple-100 dark:bg-purple-900/20',
		borderColor: 'border-purple-300 dark:border-purple-700'
	},
	[ItemAuditAction.DELETED]: {
		icon: Trash2,
		color: 'text-red-600 dark:text-red-400',
		bgColor: 'bg-red-100 dark:bg-red-900/20',
		borderColor: 'border-red-300 dark:border-red-700'
	},
	[ItemAuditAction.RESTORED]: {
		icon: RotateCcw,
		color: 'text-teal-600 dark:text-teal-400',
		bgColor: 'bg-teal-100 dark:bg-teal-900/20',
		borderColor: 'border-teal-300 dark:border-teal-700'
	}
};

// ===================== Props =====================

interface ItemHistoryModalProps {
	isOpen: boolean;
	itemId: string;
	itemName: string;
	onClose: () => void;
}

// ===================== Helper Components =====================

function RelativeTime({ date }: { date: string }) {
	const t = useTranslations('admin.ITEM_HISTORY');
	const now = new Date();
	const then = new Date(date);
	const diffMs = now.getTime() - then.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	let relativeText: string;
	if (diffMins < 1) {
		relativeText = t('JUST_NOW');
	} else if (diffMins < 60) {
		relativeText = t('MINUTES_AGO', { count: diffMins });
	} else if (diffHours < 24) {
		relativeText = t('HOURS_AGO', { count: diffHours });
	} else {
		relativeText = t('DAYS_AGO', { count: diffDays });
	}

	return (
		<span title={then.toLocaleString()} className="text-xs text-gray-500 dark:text-gray-400">
			{relativeText}
		</span>
	);
}

function ChangeItem({ field, old, newValue }: { field: string; old: unknown; newValue: unknown }) {
	const formatValue = (val: unknown): string => {
		if (val === null || val === undefined) return '(empty)';
		if (Array.isArray(val)) return val.join(', ') || '(empty)';
		if (typeof val === 'boolean') return val ? 'Yes' : 'No';
		return String(val);
	};

	return (
		<div className="flex flex-col gap-1 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
			<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
				{field}
			</span>
			<div className="flex items-center gap-2 text-sm">
				<span className="text-red-600 dark:text-red-400 line-through truncate max-w-[45%]">
					{formatValue(old)}
				</span>
				<span className="text-gray-400">→</span>
				<span className="text-green-600 dark:text-green-400 truncate max-w-[45%]">
					{formatValue(newValue)}
				</span>
			</div>
		</div>
	);
}

function HistoryEntry({ entry }: { entry: ItemAuditLogEntry }) {
	const t = useTranslations('admin.ITEM_HISTORY');
	const [expanded, setExpanded] = useState(false);

	const config = ACTION_CONFIG[entry.action];
	const Icon = config.icon;
	const changes = entry.changes ? Object.entries(entry.changes) : [];
	const hasChanges = changes.length > 0;

	const getActionLabel = (action: ItemAuditActionValues): string => {
		switch (action) {
			case ItemAuditAction.CREATED:
				return t('ACTION_CREATED');
			case ItemAuditAction.UPDATED:
				return t('ACTION_UPDATED');
			case ItemAuditAction.STATUS_CHANGED:
				return t('ACTION_STATUS_CHANGED');
			case ItemAuditAction.REVIEWED:
				return t('ACTION_REVIEWED');
			case ItemAuditAction.DELETED:
				return t('ACTION_DELETED');
			case ItemAuditAction.RESTORED:
				return t('ACTION_RESTORED');
			default:
				return action;
		}
	};

	return (
		<div className={cn('rounded-lg border p-4', config.bgColor, config.borderColor)}>
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-3">
					<div className={cn('flex items-center justify-center h-8 w-8 rounded-full shrink-0', config.bgColor)}>
						<Icon className={cn('h-4 w-4', config.color)} />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<span className={cn('font-medium', config.color)}>{getActionLabel(entry.action)}</span>
							{entry.previousStatus && entry.newStatus && (
								<span className="text-sm text-gray-600 dark:text-gray-400">
									{entry.previousStatus} → {entry.newStatus}
								</span>
							)}
						</div>
						<div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
							<span>{entry.performedByName || entry.performer?.email || t('SYSTEM')}</span>
							<span>•</span>
							<RelativeTime date={entry.createdAt} />
						</div>
						{entry.notes && (
							<p className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">
								{entry.notes}
							</p>
						)}
					</div>
				</div>

				{hasChanges && (
					<Button
						isIconOnly
						variant="light"
						size="sm"
						onPress={() => setExpanded(!expanded)}
						aria-label={expanded ? 'Hide changes' : 'Show changes'}
					>
						{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
					</Button>
				)}
			</div>

			{hasChanges && (
				<button
					type="button"
					onClick={() => setExpanded(!expanded)}
					className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
				>
					{t('VIEW_CHANGES', { count: changes.length })}
				</button>
			)}

			{expanded && hasChanges && (
				<div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
					{changes.map(([field, { old, new: newVal }]) => (
						<ChangeItem key={field} field={field} old={old} newValue={newVal} />
					))}
				</div>
			)}
		</div>
	);
}

// ===================== Filter Chips =====================

const ACTION_FILTERS: ItemAuditActionValues[] = [
	ItemAuditAction.CREATED,
	ItemAuditAction.UPDATED,
	ItemAuditAction.STATUS_CHANGED,
	ItemAuditAction.REVIEWED,
	ItemAuditAction.DELETED,
	ItemAuditAction.RESTORED
];

function ActionFilterChips({
	selected,
	onChange
}: {
	selected: ItemAuditActionValues[];
	onChange: (actions: ItemAuditActionValues[]) => void;
}) {
	const t = useTranslations('admin.ITEM_HISTORY');

	const getActionLabel = (action: ItemAuditActionValues): string => {
		switch (action) {
			case ItemAuditAction.CREATED:
				return t('ACTION_CREATED');
			case ItemAuditAction.UPDATED:
				return t('ACTION_UPDATED');
			case ItemAuditAction.STATUS_CHANGED:
				return t('ACTION_STATUS_CHANGED');
			case ItemAuditAction.REVIEWED:
				return t('ACTION_REVIEWED');
			case ItemAuditAction.DELETED:
				return t('ACTION_DELETED');
			case ItemAuditAction.RESTORED:
				return t('ACTION_RESTORED');
			default:
				return action;
		}
	};

	const toggle = (action: ItemAuditActionValues) => {
		if (selected.includes(action)) {
			onChange(selected.filter((a) => a !== action));
		} else {
			onChange([...selected, action]);
		}
	};

	return (
		<div className="flex flex-wrap gap-2 mb-4">
			{ACTION_FILTERS.map((action) => {
				const isSelected = selected.includes(action);
				const config = ACTION_CONFIG[action];
				return (
					<Chip
						key={action}
						variant={isSelected ? 'solid' : 'bordered'}
						className={cn(
							'cursor-pointer transition-all',
							isSelected && config.bgColor,
							isSelected && config.color
						)}
						onClick={() => toggle(action)}
					>
						{getActionLabel(action)}
					</Chip>
				);
			})}
		</div>
	);
}

// ===================== Main Component =====================

export function ItemHistoryModal({ isOpen, itemId, itemName, onClose }: ItemHistoryModalProps) {
	const t = useTranslations('admin.ITEM_HISTORY');
	const [page, setPage] = useState(1);
	const [actionFilter, setActionFilter] = useState<ItemAuditActionValues[]>([]);

	const { data, isLoading, isError, error } = useItemHistory({
		itemId,
		page,
		limit: 10,
		actionFilter: actionFilter.length > 0 ? actionFilter : undefined,
		enabled: isOpen
	});

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [actionFilter]);

	// Handle Escape key to close modal
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	// Handle click outside to close
	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className={MODAL_OVERLAY} onClick={handleOverlayClick}>
			<div className={MODAL_CONTAINER} role="dialog" aria-modal="true">
				{/* Header */}
				<div className={MODAL_HEADER}>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20">
								<Clock className="h-6 w-6 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-semibold text-white">{t('TITLE')}</h2>
								<p className="text-sm text-white/80 truncate max-w-xs">{itemName}</p>
							</div>
						</div>
						<Button isIconOnly variant="light" onPress={onClose} className="text-white hover:bg-white/20">
							<X size={20} />
						</Button>
					</div>
				</div>

				{/* Body */}
				<div className={MODAL_BODY}>
					{/* Filters */}
					<ActionFilterChips selected={actionFilter} onChange={setActionFilter} />

					{/* Loading State */}
					{isLoading && (
						<div className="flex items-center justify-center py-12">
							<Spinner size="lg" color="primary" />
						</div>
					)}

					{/* Error State */}
					{isError && (
						<div className="text-center py-12">
							<p className="text-red-500">{t('ERROR_LOADING')}</p>
							<p className="text-sm text-gray-500 mt-1">{error?.message}</p>
						</div>
					)}

					{/* Empty State */}
					{!isLoading && !isError && data?.logs.length === 0 && (
						<div className="text-center py-12">
							<Clock className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
							<p className="text-gray-500 dark:text-gray-400">{t('NO_HISTORY')}</p>
						</div>
					)}

					{/* History List */}
					{!isLoading && !isError && data && data.logs.length > 0 && (
						<div className="space-y-4">
							{data.logs.map((entry) => (
								<HistoryEntry key={entry.id} entry={entry} />
							))}
						</div>
					)}
				</div>

				{/* Pagination Footer */}
				{data && data.totalPages > 1 && (
					<div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
						<UniversalPagination
							page={page}
							totalPages={data.totalPages}
							onPageChange={setPage}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
