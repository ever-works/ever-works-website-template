"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, Chip } from "@heroui/react";
import { cn } from "@/lib/utils";
import { PaymentFlow } from "@/lib/types/payment";
import { PAYMENT_FLOWS } from "@/lib/config/payment-flows";
import {
    CreditCard,
    Clock,
    ChevronDown,
    Sparkles,
    CheckCircle,
    ArrowRight,
    Zap,
    Shield,
    Crown,
    TrendingUp,
    Users,
    Globe,
    Star,
    Info,
    AlertCircle,
    Loader2
} from "lucide-react";

interface PaymentFlowIndicatorProps {
  selectedFlow: PaymentFlow;
  onFlowChange?: () => void;
  showChangeButton?: boolean;
  compact?: boolean;
  animated?: boolean;
  className?: string;
  variant?: 'default' | 'premium' | 'minimal';
  showFeatures?: boolean;
  showStatus?: boolean;
  loading?: boolean;
  disabled?: boolean;
  tooltip?: boolean;
  interactive?: boolean;
  theme?: 'auto' | 'light' | 'dark';
}

interface FlowTheme {
  gradient: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  shadowColor: string;
}

const iconMap = {
  CreditCard,
  Clock,
  ChevronDown,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Crown,
  TrendingUp,
  Users,
  Globe,
  Star,
  Info,
  AlertCircle,
  Loader2
};

export function PaymentFlowIndicator({
  selectedFlow,
  onFlowChange,
  showChangeButton = false,
  compact = false,
  animated = true,
  className,
  variant = 'default',
  showFeatures = true,
  showStatus = true,
  loading = false,
  disabled = false,
  interactive = true
}: PaymentFlowIndicatorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration to prevent SSR/client mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);


  const flowConfig = useMemo(() => 
    PAYMENT_FLOWS.find(flow => flow.id === selectedFlow), 
    [selectedFlow]
  );

  const IconComponent = useMemo(() => 
    iconMap[flowConfig?.icon as keyof typeof iconMap], 
    [flowConfig?.icon]
  );

  // Theme configuration based on flow and variant
  const flowTheme = useMemo((): FlowTheme => {
    const isPayAtStart = selectedFlow === PaymentFlow.PAY_AT_START;
    
    if (variant === 'premium') {
      return {
        gradient: isPayAtStart 
          ? "from-amber-500 via-orange-500 to-red-500" 
          : "from-indigo-500 via-purple-500 to-pink-500",
        bgColor: isPayAtStart 
          ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30" 
          : "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30",
        borderColor: isPayAtStart 
          ? "border-amber-200 dark:border-amber-700" 
          : "border-indigo-200 dark:border-indigo-700",
        textColor: "text-gray-900 dark:text-white",
        accentColor: isPayAtStart ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400",
        shadowColor: isPayAtStart ? "shadow-amber-500/20" : "shadow-indigo-500/20"
      };
    }

    if (variant === 'minimal') {
      return {
        gradient: isPayAtStart 
          ? "from-gray-600 to-gray-800" 
          : "from-gray-500 to-gray-700",
        bgColor: "bg-white dark:bg-gray-800",
        borderColor: "border-gray-200 dark:border-gray-700",
        textColor: "text-gray-900 dark:text-white",
        accentColor: "text-gray-600 dark:text-gray-400",
        shadowColor: "shadow-gray-500/10"
      };
    }

    // Default variant
    return {
      gradient: isPayAtStart 
        ? "from-emerald-500 to-teal-500" 
        : "from-blue-500 to-indigo-500",
      bgColor: isPayAtStart 
        ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20" 
        : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      borderColor: isPayAtStart 
        ? "border-emerald-200 dark:border-emerald-700" 
        : "border-blue-200 dark:border-blue-700",
      textColor: "text-gray-900 dark:text-white",
      accentColor: isPayAtStart ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400",
      shadowColor: isPayAtStart ? "shadow-emerald-500/20" : "shadow-blue-500/20"
    };
  }, [selectedFlow, variant]);

  // Event handlers with debouncing
  const handleMouseEnter = useCallback(() => {
    if (!disabled && interactive) {
      setIsHovered(true);
    }
  }, [disabled, interactive]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    if (!disabled && interactive) {
      setIsPressed(true);
    }
  }, [disabled, interactive]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (!disabled && interactive) {
      setIsFocused(true);
    }
  }, [disabled, interactive]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && onFlowChange && interactive) {
      onFlowChange();
    }
  }, [disabled, onFlowChange, interactive]);

  // Loading state effect
  useEffect(() => {
    if (loading) {
      setIsHovered(false);
      setIsPressed(false);
      setIsFocused(false);
    }
  }, [loading]);

  // Show loading state during SSR to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className={cn(
        "flex items-center justify-center p-4 rounded-lg border border-gray-200 dark:border-gray-700",
        "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
        className
      )}>
        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse" />
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Loading...</span>
      </div>
    );
  }

  if (!flowConfig || !IconComponent) {
    return (
      <div className={cn(
        "flex items-center justify-center p-4 rounded-lg border border-gray-200 dark:border-gray-700",
        "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
        className
      )}>
        <AlertCircle className="w-4 h-4 mr-2" />
        <span className="text-sm">Invalid flow configuration</span>
      </div>
    );
  }

  // Compact variant
  if (compact) {
    return (
      
        <div className={cn("inline-flex items-center gap-2", className)}>
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all duration-300",
              flowTheme.bgColor,
              flowTheme.borderColor,
              interactive && !disabled && "cursor-pointer",
              animated && interactive && !disabled && "hover:scale-105 hover:shadow-md",
              isPressed && "scale-95",
              isFocused && "ring-2 ring-blue-500 ring-offset-2",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={interactive && !disabled ? 0 : undefined}
            role={interactive ? "button" : undefined}
            aria-label={`Current payment flow: ${flowConfig.title}`}
            aria-disabled={disabled}
          >
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
              `bg-gradient-to-r ${flowTheme.gradient}`,
              animated && interactive && !disabled && "group-hover:scale-110",
              loading && "animate-spin"
            )}>
              {loading ? (
                <Loader2 className="w-3 h-3 text-white" />
              ) : (
                <IconComponent className="w-3 h-3 text-white" />
              )}
            </div>
            
            <span className={cn(
              "text-sm font-medium transition-colors duration-200",
              flowTheme.textColor
            )}>
              {flowConfig.title}
            </span>
            
            {variant === 'premium' && (
              <Crown className="w-3 h-3 text-amber-500" />
            )}
            
            {showChangeButton && interactive && !disabled && (
              <ChevronDown className={cn(
                "w-3 h-3 transition-transform duration-300",
                flowTheme.accentColor,
                isHovered && "rotate-180"
              )} />
            )}
          </div>
        </div>
    );
  }

  // Full variant
  return (
   
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-300 group",
          flowTheme.bgColor,
          flowTheme.borderColor,
          interactive && !disabled && "cursor-pointer",
          animated && interactive && !disabled && "hover:scale-[1.02] hover:shadow-lg",
          isPressed && "scale-[0.98]",
          isFocused && "ring-2 ring-blue-500 ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={interactive && !disabled ? 0 : undefined}
        role={interactive ? "button" : undefined}
        aria-label={`Current payment flow: ${flowConfig.title}`}
        aria-disabled={disabled}
      >
        {/* Animated Background Pattern */}
        {animated && (
          <div className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-500",
            isHovered && "opacity-10",
            `bg-gradient-to-r ${flowTheme.gradient}`
          )} />
        )}

        {/* Premium Badge */}
        {variant === 'premium' && (
          <div className="absolute top-2 left-2 z-20">
            <Badge 
              color="warning" 
              variant="solid" 
              size="sm"
              className="font-bold"
            >
              PREMIUM
            </Badge>
          </div>
        )}

                 <div className="relative z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300",
                `bg-gradient-to-r ${flowTheme.gradient}`,
                animated && interactive && !disabled && "group-hover:scale-110 group-hover:rotate-3",
                loading && "animate-pulse"
              )}>
                {loading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <IconComponent className="w-5 h-5 text-white" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn(
                    "text-lg font-semibold transition-colors duration-200",
                    flowTheme.textColor
                  )}>
                    {flowConfig.title}
                  </h3>
                  
                  {flowConfig.badge && (
                    <Chip 
                      color={variant === 'premium' ? 'warning' : 'primary'}
                      variant="solid"
                      size="sm"
                      className="font-bold"
                    >
                      {flowConfig.badge}
                    </Chip>
                  )}
                  
                  {variant === 'premium' && (
                    <Crown className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                
                <p className={cn(
                  "text-sm transition-colors duration-200",
                  flowTheme.accentColor
                )}>
                  {flowConfig.description}
                </p>
              </div>
            </div>

            {showChangeButton && interactive && !disabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlowChange?.();
                }}
                className={cn(
                  "transition-all duration-300",
                  animated && "hover:scale-105",
                  flowTheme.accentColor
                )}
                disabled={loading}
              >
                <span>Change</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>

          {/* Enhanced Features */}
          {showFeatures && flowConfig.features && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                {flowConfig.features.slice(0, 4).map((feature, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center gap-1 text-xs transition-all duration-200",
                      flowTheme.accentColor,
                      animated && "hover:translate-x-1"
                    )}
                    style={{
                      transitionDelay: animated ? `${index * 50}ms` : '0ms'
                    }}
                  >
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Indicator */}
          {showStatus && (
            <div className="absolute top-2 right-2 z-20">
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                animated && "animate-pulse",
                `bg-gradient-to-r ${flowTheme.gradient}`
              )} />
            </div>
                     )}
         </div>

        {/* Hover Effect Overlay */}
        {animated && isHovered && interactive && !disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none" />
        )}

        {/* Focus Ring */}
        {isFocused && interactive && !disabled && (
          <div className="absolute inset-0 ring-2 ring-blue-500 ring-offset-2 rounded-lg pointer-events-none" />
        )}
      </Card>
  );
}

// Specialized variants for different use cases
export function PaymentFlowIndicatorPremium(props: Omit<PaymentFlowIndicatorProps, 'variant'>) {
  return <PaymentFlowIndicator {...props} variant="premium" />;
}

export function PaymentFlowIndicatorMinimal(props: Omit<PaymentFlowIndicatorProps, 'variant'>) {
  return <PaymentFlowIndicator {...props} variant="minimal" />;
}

export function PaymentFlowIndicatorCompact(props: Omit<PaymentFlowIndicatorProps, 'compact'>) {
  return <PaymentFlowIndicator {...props} compact={true} />;
}

export function PaymentFlowIndicatorStatic(props: Omit<PaymentFlowIndicatorProps, 'interactive'>) {
  return <PaymentFlowIndicator {...props} interactive={false} />;
} 