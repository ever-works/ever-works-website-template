import React from "react";
import { cn } from "@/lib/utils";

export interface HeroProps {
  /** Badge text displayed at the top */
  badgeText?: string;
  /** Main title */
  title?: string | React.ReactNode;
  /** Description below the title */
  description?: string | React.ReactNode;
  /** Additional classes for the main container */
  className?: string;
  /** Additional classes for the title */
  titleClassName?: string;
  /** Additional classes for the description */
  descriptionClassName?: string;
  /** Show background effects (gradients, blobs) */
  showBackgroundEffects?: boolean;
  /** Additional content to display below the description */
  children?: React.ReactNode;
}

export default function Hero({
  badgeText,
  title,
  description,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  showBackgroundEffects = true,
  children,
}: HeroProps) {
  return (
    <div
      className={cn(
        "w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 relative",
        className
      )}
    >
      {/* Background Effects */}
      {showBackgroundEffects && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Header Section */}
        <div className="pt-2 pb-1 sm:pt-3 sm:pb-2">
          <div className="text-center mb-2 sm:mb-3">
            {/* Introducing badge */}
            {badgeText && (
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <div className="flex items-center text-gray-900 dark:text-gray-200 bg-gray-200 dark:bg-[#1F2937] py-2 px-4 rounded-full gap-2 text-sm font-medium">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  {badgeText}
                </div>
              </div>
            )}

            {title && (
              <h1
                className={cn(
                  "text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors duration-300",
                  titleClassName
                )}
              >
                {title}
              </h1>
            )}

            {description && (
              <p
                className={cn(
                  "text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-normal sm:leading-relaxed transition-colors duration-300",
                  descriptionClassName
                )}
              >
                {description}
              </p>
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
