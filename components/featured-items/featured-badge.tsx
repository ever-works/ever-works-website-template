'use client';

import { Badge } from '@/components/ui/badge';
import { Star, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturedBadgeProps {
  className?: string;
  variant?: 'default' | 'compact' | 'expiring' | 'hero';
  showIcon?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FeaturedBadge({
  className,
  variant = 'default',
  showIcon = true,
  showText = true,
  size = 'md'
}: FeaturedBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (variant === 'compact') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        sizeClasses[size],
        className
      )}>
        {showIcon && <Star className={cn(iconSizes[size], "fill-current")} />}
        {showText && <span className="font-medium">Featured</span>}
      </div>
    );
  }

  if (variant === 'expiring') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        sizeClasses[size],
        className
      )}>
        {showIcon && <Clock className={cn(iconSizes[size])} />}
        {showText && <span className="font-medium">Expires Soon</span>}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900 dark:to-orange-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800",
        sizeClasses[size],
        className
      )}>
        {showIcon && <Sparkles className={cn(iconSizes[size], "fill-current")} />}
        {showText && <span className="font-bold">Featured</span>}
      </div>
    );
  }

  // Default variant
  return (
    <Badge
      variant="secondary"
      className={cn(
        "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Star className={cn(iconSizes[size], "mr-1 fill-current")} />}
      {showText && "Featured"}
    </Badge>
  );
}
