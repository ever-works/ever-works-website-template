"use client";

import { Image as ImageIcon, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenshotPlaceholderProps {
  title: string;
  description?: string;
  width?: number;
  height?: number;
  className?: string;
  type?: "screenshot" | "video" | "diagram";
  aspectRatio?: "16:9" | "4:3" | "1:1" | "3:2";
}

export function ScreenshotPlaceholder({
  title,
  description,
  width,
  height,
  className,
  type = "screenshot",
  aspectRatio = "16:9"
}: ScreenshotPlaceholderProps) {
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "16:9":
        return "aspect-video";
      case "4:3":
        return "aspect-[4/3]";
      case "1:1":
        return "aspect-square";
      case "3:2":
        return "aspect-[3/2]";
      default:
        return "aspect-video";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "video":
        return <Play className="w-12 h-12 text-gray-400" fill="currentColor" />;
      case "diagram":
        return (
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return <ImageIcon className="w-12 h-12 text-gray-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "video":
        return "Video Tutorial";
      case "diagram":
        return "Diagram";
      default:
        return "Screenshot";
    }
  };

  return (
    <div className={cn("my-8", className)}>
      <div 
        className={cn(
          "relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl",
          "bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center",
          "transition-colors duration-300 hover:border-gray-400 dark:hover:border-gray-500",
          !width && !height && getAspectRatioClass()
        )}
        style={width && height ? { width, height } : undefined}
      >
        {/* Type badge */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
          {getTypeLabel()}
        </div>

        {/* Main content */}
        <div className="text-center p-8">
          <div className="mb-4">
            {getIcon()}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
              {description}
            </p>
          )}
          
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
            📸 Screenshot will be added here
          </div>
        </div>

        {/* Corner decoration */}
        <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded border-dashed"></div>
      </div>
    </div>
  );
}

interface ImageGalleryProps {
  images: Array<{
    title: string;
    description?: string;
    type?: "screenshot" | "video" | "diagram";
  }>;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function ImageGallery({ images, columns = 2, className }: ImageGalleryProps) {
  const getGridClass = () => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  };

  return (
    <div className={cn("my-8", className)}>
      <div className={cn("grid gap-6", getGridClass())}>
        {images.map((image, index) => (
          <ScreenshotPlaceholder
            key={index}
            title={image.title}
            description={image.description}
            type={image.type}
          />
        ))}
      </div>
    </div>
  );
} 