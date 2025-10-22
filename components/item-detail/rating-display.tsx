"use client";

import { useTranslations } from "next-intl";
import { useItemRating } from "@/hooks/use-item-rating";
import { Rating } from "@/components/ui/rating";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

interface RatingDisplayProps {
  itemId: string;
}

export function RatingDisplay({ itemId }: RatingDisplayProps) {
  const t = useTranslations();
  const { features, isLoading } = useFeatureFlags();
  const { rating } = useItemRating(itemId);

  // Hide rating display when feature is disabled
  if (isLoading || !features.ratings) {
    return null;
  }

  return (
    <div className="flex justify-between items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-300 group">
      <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        {t("itemDetail.RATING")}
      </span>
      <div className="flex items-center gap-2">
        <Rating value={rating.averageRating} readOnly size="sm" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({rating.totalRatings})
        </span>
      </div>
    </div>
  );
} 