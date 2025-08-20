"use client";

import { useFavorites } from '@/hooks/use-favorites';
import { useTranslations } from 'next-intl';
import { FavoriteButton } from '../favorite-button';
import { Heart, Star, ExternalLink, Folder } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks';

export function FavoritesClient() {
  const { user } = useCurrentUser();
  const { favorites, isLoading, error } = useFavorites();
  const t = useTranslations('common');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || '';

  if (!user?.id) {
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
            href={`/${locale}/auth/signin`}
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
          <div
            key={i}
            className="bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg animate-pulse"
          >
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
  if (favorites.length === 0) {
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
            href={`/${locale}`}
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
            {favorites.length} {t('FAVORITE_ITEMS', { defaultValue: 'favorite items' })}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="group relative bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50"
          >
            {/* Favorite button */}
            <div className="absolute top-4 right-4 z-10">
              <FavoriteButton
                itemSlug={favorite.itemSlug}
                itemName={favorite.itemName}
                itemIconUrl={favorite.itemIconUrl}
                itemCategory={favorite.itemCategory}
                variant="heart"
                size="sm"
                className="opacity-100"
              />
            </div>

            {/* Icon and title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 bg-gradient-to-br from-theme-primary-10 to-indigo-100 border border-theme-primary-500 group-hover:from-theme-primary-10 group-hover:to-indigo-200 dark:from-theme-primary-10 dark:to-indigo-900/30 dark:border-theme-primary-700/30 dark:group-hover:from-theme-primary-800/40 dark:group-hover:to-indigo-800/40 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-md">
                  {favorite.itemIconUrl ? (
                    <Image
                      src={favorite.itemIconUrl}
                      alt={`${favorite.itemName} icon`}
                      className="w-6 h-6 object-contain transition-transform duration-500 group-hover:scale-110"
                      width={24}
                      height={24}
                    />
                  ) : (
                    <Folder className="w-6 h-6 text-theme-primary dark:text-theme-primary transition-transform duration-500 group-hover:scale-110" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                  {favorite.itemName}
                </h3>
                {favorite.itemCategory && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {favorite.itemCategory}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <Link
                href={`/${locale}/items/${favorite.itemSlug}`}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-theme-primary-600 to-theme-primary-700 hover:from-theme-primary-700 hover:to-theme-primary-800 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('VIEW_DETAILS', { defaultValue: 'View Details' })}
              </Link>
            </div>

            {/* Added date */}
            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('ADDED_ON', { defaultValue: 'Added' })} {new Date(favorite.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
