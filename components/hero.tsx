import React from "react";
import { cn } from "@/lib/utils";
import { Container } from "./ui/container";

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
          <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-600/20 dark:to-blue-700/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-blue-600/10 to-blue-500/10 dark:from-blue-700/20 dark:to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-600/20 dark:to-blue-700/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full py-8 sm:py-10 md:py-12">
        {/* Header Section */}
        <div className="pt-2 pb-1 sm:pt-3 sm:pb-2">
          <Container maxWidth="7xl" padding="default">
            {/* Introducing badge */}
            {badgeText && (
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <div className="flex items-center text-gray-900 dark:text-gray-200 bg-gray-200 dark:bg-[#1F2937] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full gap-2 text-xs sm:text-sm font-medium">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                {badgeText}
                </div>
              </div>
            )}

            {title && (
              <h1
                className={cn(
                  "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors duration-300 px-4 sm:px-0",
                  titleClassName
                )}
              >
                {title}
              </h1>
            )}

            {description && (
              <p
                className={cn(
                  "text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed sm:leading-relaxed transition-colors duration-300 px-4 sm:px-0",
                  descriptionClassName
                )}
              >
                {description}
              </p>
            )}

            <div className="mt-4 sm:mt-6">
              {children}
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
}
