'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface AdminSurveyCreationButtonProps {
  itemId?: string;
  variant?: 'default' | 'outline-solid' | 'ghost';
  size?: 'sm' | 'default' | 'lg' | 'touch';
  className?: string;
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  default: 'h-9 w-9',
  lg: 'h-10 w-10',
  touch: 'h-11 w-11 min-h-[44px] min-w-[44px]',
};

export function AdminSurveyCreationButton({
  itemId,
  variant = 'outline-solid',
  size = 'sm',
  className = '',
  showLabel = false
}: AdminSurveyCreationButtonProps) {
  const t = useTranslations('survey');
  const [showTooltip, setShowTooltip] = useState(false);

  // Build URL with query parameters if itemId is provided
  const createSurveyUrl = itemId
    ? `/admin/surveys/create?itemId=${encodeURIComponent(itemId)}`
    : '/admin/surveys/create';

  // Icon-only mode with tooltip
  if (!showLabel) {
    return (
      <div
        className="relative inline-flex"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Link href={createSurveyUrl}>
          <Button
            variant={variant}
            className={cn(
              'flex items-center justify-center transition-all duration-200',
              sizeClasses[size],
              'p-0',
              className
            )}
            aria-label={t('CREATE_SURVEY')}
          >
            <FileText className="w-4 h-4" />
          </Button>
        </Link>
        {/* State-based Tooltip */}
        {showTooltip && (
          <div
            className={cn(
              "absolute z-[9999] pointer-events-none",
              "whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-150",
              "bottom-full left-1/2 -translate-x-1/2 mb-2"
            )}
            role="tooltip"
          >
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-medium shadow-lg">
              {t('CREATE_SURVEY')}
            </div>
            {/* Arrow */}
            <div
              className="absolute w-0 h-0 border-4 top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-100"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={createSurveyUrl}>
      <Button
        variant={variant}
        className={cn(
          'flex items-center justify-center transition-all duration-200 gap-2',
          className
        )}
        aria-label={t('CREATE_SURVEY')}
      >
        <FileText className="w-4 h-4" />
        {t('CREATE_SURVEY')}
      </Button>
    </Link>
  );
}
