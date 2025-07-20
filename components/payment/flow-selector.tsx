"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PaymentFlow } from "@/lib/types/payment";
import { PAYMENT_FLOWS } from "@/lib/config/payment-flows";
import {
    CreditCard,
    Clock,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Save,
    Shield,
    Zap,
    Star,
    TrendingUp,
    Info,
    AlertCircle,
    ChevronRight,
    Play,
    Pause
} from "lucide-react";

interface PaymentFlowSelectorProps {
  selectedFlow: PaymentFlow;
  onFlowSelect: (flow: PaymentFlow) => void;
  className?: string;
  showComparison?: boolean;
  showCurrentSelection?: boolean;
  compact?: boolean;
  animated?: boolean;
}

const iconMap = {
  CreditCard,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Save,
  Shield,
  Zap,
  Star,
  TrendingUp,
  Info,
  AlertCircle,
  ChevronRight,
  Play,
  Pause
};

export function PaymentFlowSelector({
  selectedFlow,
  onFlowSelect,
  className,
  showComparison = true,
  showCurrentSelection = true,
  compact = false,
  animated = true
}: PaymentFlowSelectorProps) {
  const [hoveredFlow, setHoveredFlow] = useState<PaymentFlow | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const selectedConfig = useMemo(() => 
    PAYMENT_FLOWS.find(flow => flow.id === selectedFlow), 
    [selectedFlow]
  );

  const handleFlowSelect = async (flow: PaymentFlow) => {
    if (isSelecting) return;
    
    setIsSelecting(true);
    
    // Simulate selection delay for better UX
    await new Promise(resolve => setTimeout(resolve, 150));
    
    onFlowSelect(flow);
    setIsSelecting(false);
  };

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Enhanced Compact Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 mb-3">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Smart Selection
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Choose Payment Flow
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Select how you want to handle payment
          </p>
        </div>

        {/* Enhanced Compact Flow Cards */}
        <div className="grid grid-cols-1 gap-3">
          {PAYMENT_FLOWS.map((flow, index) => {
            const IconComponent = iconMap[flow.icon as keyof typeof iconMap];
            const isSelected = selectedFlow === flow.id;
            const isHovered = hoveredFlow === flow.id;

            return (
              <Card
                key={flow.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 p-4 border-2 group overflow-hidden",
                  isSelected
                    ? `${flow.borderColor} ${flow.darkBorderColor} bg-gradient-to-br ${flow.bgColor} ${flow.darkBgColor} shadow-lg scale-[1.02]`
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md",
                  animated && "hover:scale-[1.01]",
                  isSelecting && "pointer-events-none opacity-75"
                )}
                onClick={() => handleFlowSelect(flow.id)}
                onMouseEnter={() => setHoveredFlow(flow.id)}
                onMouseLeave={() => setHoveredFlow(null)}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Animated Background */}
                {animated && (
                  <div className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-500",
                    isHovered && "opacity-10",
                    flow.id === PaymentFlow.PAY_AT_START
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  )} />
                )}

                {/* Enhanced Badge */}
                {flow.badge && (
                  <div className={cn(
                    "absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold text-white transition-all duration-300",
                    flow.id === PaymentFlow.PAY_AT_START 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg",
                    animated && "hover:scale-110"
                  )}>
                    {flow.badge}
                  </div>
                )}

                {/* Enhanced Selection Indicator */}
                {isSelected && (
                  <div className={cn(
                    "absolute -top-1 -left-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                    animated && "animate-pulse"
                  )}>
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Compact Content */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg",
                    `bg-gradient-to-r ${flow.color}`,
                    animated && "group-hover:scale-110 group-hover:rotate-3"
                  )}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                      {flow.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {flow.description}
                    </p>
                  </div>

                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "transition-all duration-300 relative overflow-hidden",
                      isSelected && `bg-gradient-to-r ${flow.color}`,
                      animated && "hover:scale-105"
                    )}
                    disabled={isSelecting}
                  >
                    {isSelecting && isSelected ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Selecting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isSelected ? "Selected" : "Select"}
                        {!isSelected && <ChevronRight className="w-3 h-3" />}
                      </div>
                    )}
                  </Button>
                </div>

                {/* Hover Effect */}
                {animated && isHovered && !isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                )}
              </Card>
            );
          })}
        </div>

        {/* Enhanced Compact Comparison */}
        {showComparison && (
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-500" />
              <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                Quick Comparison
              </h5>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h6 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-purple-500" />
                  Pay First
                </h6>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 text-green-500" />
                    Immediate publication
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 text-green-500" />
                    No review delays
                  </li>
                  <li className="flex items-center gap-1 text-gray-500">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Payment upfront
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h6 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  Pay Later
                </h6>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 text-green-500" />
                    No upfront cost
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 text-green-500" />
                    Review first
                  </li>
                  <li className="flex items-center gap-1 text-gray-500">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Pay after approval
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Enhanced Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 mb-4">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Choose Your Payment Flow
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          How would you like to proceed?
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Select the payment flow that works best for you.
        </p>
      </div>

      {/* Enhanced Flow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {PAYMENT_FLOWS.map((flow, index) => {
          const IconComponent = iconMap[flow.icon as keyof typeof iconMap];
          const isSelected = selectedFlow === flow.id;
          const isHovered = hoveredFlow === flow.id;

          return (
            <Card
              key={flow.id}
              className={cn(
                "relative cursor-pointer transition-all duration-500 p-5 border-2 group hover:scale-[1.02] overflow-hidden",
                isSelected
                  ? `${flow.borderColor} ${flow.darkBorderColor} bg-gradient-to-br ${flow.bgColor} ${flow.darkBgColor} shadow-xl scale-[1.02]`
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg",
                isSelecting && "pointer-events-none opacity-75"
              )}
              onClick={() => handleFlowSelect(flow.id)}
              onMouseEnter={() => setHoveredFlow(flow.id)}
              onMouseLeave={() => setHoveredFlow(null)}
              style={{
                animationDelay: `${index * 200}ms`
              }}
            >
              {/* Animated Background */}
              {animated && (
                <div className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-700",
                  isHovered && "opacity-5",
                  flow.id === PaymentFlow.PAY_AT_START
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                )} />
              )}

              {/* Enhanced Badge */}
              {flow.badge && (
                <div className={cn(
                  "absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold text-white transition-all duration-300",
                  flow.id === PaymentFlow.PAY_AT_START 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg",
                  animated && "hover:scale-110"
                )}>
                  {flow.badge}
                </div>
              )}

              {/* Enhanced Selection Indicator */}
              {isSelected && (
                <div className={cn(
                  "absolute -top-2 -left-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                  animated && "animate-pulse"
                )}>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-start gap-3 mb-4 relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300",
                  `bg-gradient-to-r ${flow.color}`,
                  animated && "group-hover:scale-110 group-hover:rotate-3"
                )}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                    {flow.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    {flow.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {flow.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4 relative z-10">
                {flow.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 transition-all duration-300">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      flow.id === PaymentFlow.PAY_AT_START 
                        ? "bg-purple-500"
                        : "bg-blue-500",
                      animated && "group-hover:scale-150"
                    )} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Enhanced Selection Button */}
              <Button
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "w-full h-10 transition-all duration-300 relative overflow-hidden",
                  isSelected
                    ? `bg-gradient-to-r ${flow.color} hover:scale-105`
                    : "hover:scale-105",
                  isSelecting && "pointer-events-none"
                )}
                disabled={isSelecting}
              >
                {isSelecting && isSelected ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Selecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Selected
                      </>
                    ) : (
                      <>
                        Select This Flow
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </div>
                )}
              </Button>

              {/* Hover Effect */}
              {animated && isHovered && !isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
              )}
            </Card>
          );
        })}
      </div>

      {/* Enhanced Flow Comparison */}
      {showComparison && (
        <div className="max-w-3xl mx-auto">
          <Card className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Quick Comparison
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose the option that best fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  Pay First
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Immediate publication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>No review delays</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <AlertCircle className="w-3 h-3" />
                    <span>Payment required upfront</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Pay Later
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>No upfront cost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Review before payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <AlertCircle className="w-3 h-3" />
                    <span>Payment after approval</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced Current Selection Info */}
      {showCurrentSelection && selectedConfig && (
        <div className="text-center">
          <div className={cn(
            "inline-flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300",
            selectedFlow === PaymentFlow.PAY_AT_START
              ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
              : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
            animated && "hover:scale-105"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
              selectedFlow === PaymentFlow.PAY_AT_START
                ? "bg-purple-500"
                : "bg-blue-500",
              animated && "animate-pulse"
            )}>
              {selectedFlow === PaymentFlow.PAY_AT_START ? (
                <CreditCard className="w-3 h-3 text-white" />
              ) : (
                <Clock className="w-3 h-3 text-white" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedConfig.title} Selected
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {selectedConfig.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 