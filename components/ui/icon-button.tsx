"use client";

import * as React from "react";
import { Tooltip } from "@heroui/tooltip";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type IconButtonSize = "sm" | "default" | "touch";

interface IconButtonProps extends Omit<ButtonProps, "size"> {
    tooltip: string;
    tooltipPlacement?: "top" | "bottom" | "left" | "right";
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
            <Tooltip
                content={displayTooltip}
                showArrow
                placement={tooltipPlacement}
                delay={300}
                classNames={{
                    content:
                        "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded-sm text-xs font-medium",
                }}
            >
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
            </Tooltip>
        );
    }
);

IconButton.displayName = "IconButton";

export { IconButton, type IconButtonProps, type IconButtonSize };
