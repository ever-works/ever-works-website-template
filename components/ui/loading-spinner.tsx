import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "white" | "gray";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8"
};

const colorClasses = {
  primary: "border-theme-primary border-t-transparent",
  white: "border-white border-t-transparent",
  gray: "border-gray-400 border-t-transparent dark:border-gray-500"
};

export function LoadingSpinner({ size = "md", className, color = "primary" }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "border-2 rounded-full animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

interface InlineLoadingProps {
  text?: string;
  size?: "sm" | "md";
  className?: string;
}

export function InlineLoading({ text = "Loading...", size = "sm", className }: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LoadingSpinner size={size} color="gray" />
      <span className="text-sm text-gray-500 dark:text-gray-400">{text}</span>
    </div>
  );
}

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: "sm" | "md";
  className?: string;
}

export function ButtonLoading({
  isLoading,
  children,
  loadingText,
  size = "sm",
  className
}: ButtonLoadingProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LoadingSpinner size={size} color="white" />
      {loadingText && <span>{loadingText}</span>}
    </div>
  );
}