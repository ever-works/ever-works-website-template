'use client';

import { useState, useMemo } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { useTranslations } from 'next-intl';
import { Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { Category, ItemData, Tag } from '@/lib/content';
import Item from '../item';
import { useSession } from 'next-auth/react';
import { LayoutClassic } from '../layouts';
import { UniversalPagination } from '../universal-pagination';
type ListingProps = {
	total: number;
	basePath: string;
	categories: Category[];
	tags: Tag[];
	items: ItemData[];
};
export function FavoritesClient(props: ListingProps) {
	const { data: session } = useSession();
	const { favorites, isLoading, error } = useFavorites();
	const t = useTranslations('common');
	
	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12;
	
	// Filter items to only show favorites
	const favoriteItems = useMemo(() => 
		props.items.filter((item) => favorites.some((fav) => fav.itemSlug === item.slug)),
		[props.items, favorites]
	);
	
	// Calculate pagination
	const totalPages = Math.ceil(favoriteItems.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedItems = favoriteItems.slice(startIndex, endIndex);
	
	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	if (!session?.user?.id) {
		return (
			<div className="text-center py-12">
				<div className="max-w-md mx-auto">
					<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
						<Heart className="w-8 h-8 text-red-500 dark:text-red-400" />
					</div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						{t('SIGN_IN_TO_VIEW_FAVORITES', {
							defaultValue: 'Sign in to view your favorites'
						})}
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6">
						{t('FAVORITES_SIGN_IN_DESCRIPTION', {
							defaultValue: 'Create an account or sign in to save and view your favorite items.'
						})}
					</p>
					<Link
						href={`/auth/signin`}
						className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-theme-primary-600 to-theme-primary-700 hover:from-theme-primary-700 hover:to-theme-primary-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
					>
						{t('SIGN_IN_TO_VIEW_FAVORITES', {
							defaultValue: 'Sign in to view your favorites'
						})}
					</Link>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg animate-pulse">
						<div className="flex items-center gap-4 mb-4">
							<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
							<div className="flex-1">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
							</div>
						</div>
						<div className="space-y-2">
							<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
							<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
						</div>
					</div>
				))}
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="text-center py-12">
				<div className="max-w-md mx-auto">
					<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
						<Heart className="w-8 h-8 text-red-500 dark:text-red-400" />
					</div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						{t('ERROR_LOADING_FAVORITES', {
							defaultValue: 'Error loading favorites'
						})}
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6">
						{t('FAVORITES_ERROR_DESCRIPTION', {
							defaultValue: 'There was an error loading your favorites. Please try again.'
						})}
					</p>
					<button
						onClick={() => window.location.reload()}
						className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-theme-primary-600 to-theme-primary-700 hover:from-theme-primary-700 hover:to-theme-primary-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
					>
						{t('RETRY')}
					</button>
				</div>
			</div>
		);
	}

	// Empty state
	if (favoriteItems.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="max-w-md mx-auto">
					<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
						<Star className="w-8 h-8 text-gray-500 dark:text-gray-400" />
					</div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						{t('NO_FAVORITES_YET', {
							defaultValue: 'No favorites yet'
						})}
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6">
						{t('FAVORITES_EMPTY_DESCRIPTION', {
							defaultValue: 'Start exploring and add items to your favorites to see them here.'
						})}
					</p>
					<Link
						href={`/`}
						className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-theme-primary-600 to-theme-primary-700 hover:from-theme-primary-700 hover:to-theme-primary-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
					>
						{t('EXPLORE_ITEMS', {
							defaultValue: 'Explore Items'
						})}
					</Link>
				</div>
			</div>
		);
	}

	// Favorites grid
	return (
		<div className="space-y-6">
			{/* Stats */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Heart className="w-5 h-5 text-red-500" />
					<span className="text-sm text-gray-600 dark:text-gray-300">
						{favoriteItems.length} {t('FAVORITE_ITEMS', { defaultValue: 'favorite items' })}
					</span>
				</div>
			</div>
			<LayoutClassic>
				{paginatedItems.map((favorite) => (
					<Item key={favorite.slug} {...favorite} />
				))}
			</LayoutClassic>
			{totalPages > 1 && (
				<div className="flex justify-center mt-8">
					<UniversalPagination
						page={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				</div>
			)}
		</div>
	);
}
