'use client';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollSentinelProps {
	hasMore: boolean;
	isLoading: boolean;
	error: Error | null;
	onRetry: () => void;
}

export const InfiniteScrollSentinel = forwardRef<HTMLDivElement, InfiniteScrollSentinelProps>(
	function InfiniteScrollSentinel({ hasMore, isLoading, error, onRetry }, ref) {
		if (!hasMore && !error) {
			return (
				<div className="text-center py-8">
					<p className="text-sm text-gray-500 dark:text-gray-400">You've reached the end</p>
				</div>
			);
		}

		if (!hasMore) {
			return null;
		}

		return (
			<div ref={ref} className="w-full flex items-center justify-center py-8 min-h-[100px]">
				{error ? (
					<div className="text-center py-4">
						<p className="text-sm text-red-600 dark:text-red-400 mb-2">Failed to load more collections</p>
						<button
							onClick={onRetry}
							className="text-sm text-theme-primary-500 dark:text-theme-primary-400 hover:text-theme-primary-700 dark:hover:text-theme-primary-300 transition-colors focus:outline-hidden focus:ring-2 focus:ring-theme-primary-500 rounded-sm px-2 py-1"
						>
							Retry
						</button>
					</div>
				) : (
					<div className="flex items-center gap-2 text-theme-primary-500 dark:text-theme-primary-400">
						{isLoading && (
							<>
								<Loader2 className="h-5 w-5 animate-spin" />
								<span className="text-sm font-medium">Loading...</span>
							</>
						)}
					</div>
				)}
			</div>
		);
	}
);
