"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type IconButtonSize = "sm" | "default" | "touch";

interface IconButtonProps extends Omit<ButtonProps, "size"> {
    tooltip: string;
    tooltipPlacement?: "top" | "bottom";
    isLoading?: boolean;
    loadingTooltip?: string;
    icon: React.ReactNode;
    size?: IconButtonSize;
    "aria-label"?: string;
}

const sizeClasses: Record<IconButtonSize, string> = {
    sm: "h-8 w-8 min-h-[32px] min-w-[32px]",
    default: "h-9 w-9 min-h-[36px] min-w-[36px]",
    touch: "h-11 w-11 min-h-[44px] min-w-[44px]",
};

const iconSizes: Record<IconButtonSize, number> = {
    sm: 14,
    default: 16,
    touch: 18,
};

const tooltipPositionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
};

const arrowPositionClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-100",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 dark:border-b-gray-100",
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    (
        {
            tooltip,
            tooltipPlacement = "top",
            isLoading = false,
            loadingTooltip,
            icon,
            size = "touch",
            className,
            disabled,
            "aria-label": ariaLabel,
            ...props
        },
        ref
    ) => {
        const displayTooltip = isLoading && loadingTooltip ? loadingTooltip : tooltip;

        return (
            <div className="relative group inline-flex">
                <Button
                    ref={ref}
                    className={cn(
                        sizeClasses[size],
                        "p-0 transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-offset-gray-900",
                        className
                    )}
                    disabled={disabled || isLoading}
                    aria-label={ariaLabel || tooltip}
                    {...props}
                >
                    {isLoading ? (
                        <Loader2 size={iconSizes[size]} className="animate-spin" />
                    ) : (
                        React.isValidElement(icon)
                            ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
                                  size: iconSizes[size],
                              })
                            : icon
                    )}
                </Button>
                {/* CSS-based Tooltip */}
                <div
                    className={cn(
                        "absolute z-50 pointer-events-none",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-300",
                        "whitespace-nowrap",
                        tooltipPositionClasses[tooltipPlacement]
                    )}
                    role="tooltip"
                >
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-medium shadow-lg">
                        {displayTooltip}
                    </div>
                    {/* Arrow */}
                    <div
                        className={cn(
                            "absolute w-0 h-0 border-4",
                            arrowPositionClasses[tooltipPlacement]
                        )}
                    />
                </div>
            </div>
        );
    }
);

IconButton.displayName = "IconButton";

export { IconButton, type IconButtonProps, type IconButtonSize };
