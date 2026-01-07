'use client';

import React from 'react';
import Link from 'next/link';
import { Tooltip } from '@heroui/tooltip';
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

  // Build URL with query parameters if itemId is provided
  const createSurveyUrl = itemId
    ? `/admin/surveys/create?itemId=${encodeURIComponent(itemId)}`
    : '/admin/surveys/create';

  const buttonContent = (
    <Button
      variant={variant}
      className={cn(
        'flex items-center justify-center transition-all duration-200',
        !showLabel && sizeClasses[size],
        !showLabel && 'p-0',
        showLabel && 'gap-2',
        className
      )}
      aria-label={t('CREATE_SURVEY')}
    >
      <FileText className="w-4 h-4" />
      {showLabel && t('CREATE_SURVEY')}
    </Button>
  );

  // Wrap with tooltip when showing icon only
  if (!showLabel) {
    return (
      <Tooltip
        content={t('CREATE_SURVEY')}
        showArrow
        placement="top"
        delay={300}
        classNames={{
          content:
            'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded-sm text-xs font-medium',
        }}
      >
        <Link href={createSurveyUrl}>
          {buttonContent}
        </Link>
      </Tooltip>
    );
  }

  return <Link href={createSurveyUrl}>{buttonContent}</Link>;
}
