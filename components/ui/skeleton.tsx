import { Skeleton as HeroSkeleton } from "@heroui/react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <HeroSkeleton
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

function TableSkeleton({ rows = 5, columns = 6, className }: TableSkeletonProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Header skeleton */}
      <div className="flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={`header-${index}`}
            className={cn(
              "h-4",
              index === 0 ? "w-24" : index === 1 ? "w-32" : "w-20"
            )}
          />
        ))}
      </div>

      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex items-center space-x-4 p-4 border-b border-gray-100 dark:border-gray-800"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn(
                "h-4",
                colIndex === 0 ? "w-24" : colIndex === 1 ? "w-32" : "w-16"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  className?: string;
}

function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", className)}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, TableSkeleton, CardSkeleton }
