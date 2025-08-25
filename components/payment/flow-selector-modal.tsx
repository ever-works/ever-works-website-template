"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentFlow } from "@/lib/payment/types/payment";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Card
} from "@heroui/react";
import {
  CreditCard,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFlowSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFlow: PaymentFlow;
  onFlowSelect: (flow: PaymentFlow) => void;
  title?: string;
}

export function PaymentFlowSelectorModal({
  isOpen,
  onClose,
  selectedFlow,
  onFlowSelect,
  title = "Choose Payment Flow",
}: PaymentFlowSelectorModalProps) {
  const {
    isOpen: isModalOpen,
    onOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  // Sync modal state with prop
  React.useEffect(() => {
    if (isOpen) {
      onOpen();
    } else {
      onModalClose();
    }
  }, [isOpen, onOpen, onModalClose]);

  const handleClose = () => {
    onModalClose();
    onClose();
  };

  const handleChangeFlow = async (flow: PaymentFlow) => {
    if (flow === selectedFlow) return;

    setIsLoading(true);
    try {
      onFlowSelect(flow);
    } finally {
      setIsLoading(false);
    }
  };

  const flows = [
    {
      flow: PaymentFlow.PAY_AT_START,
      title: "Pay First",
      description: "Payment required before submission",
      icon: CreditCard,
      gradient: "from-theme-primary-500 to-theme-primary-600",
      benefits: ["Immediate processing", "Priority review", "Faster approval"],
    },
    {
      flow: PaymentFlow.PAY_AT_END,
      title: "Pay Later",
      description: "Payment after approval",
      icon: Clock,
      gradient: "from-theme-primary-500 to-theme-primary-600",
      benefits: ["No upfront cost", "Review before payment", "Risk-free trial"],
    },
  ];

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      isDismissable={true}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        base: "border-0 shadow-lg bg-white dark:bg-gray-900",
        backdrop: "bg-black/50",
        wrapper: "p-4",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select your preferred payment flow
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-4">
              {flows.map((flowOption, index) => {
                const IconComponent = flowOption.icon;
                const isSelected = selectedFlow === flowOption.flow;

                return (
                  <Card
                    key={flowOption.flow}
                    className={
                      cn(
                        "transition-colors duration-300",
                        isSelected
                          ? "bg-blue-50 dark:bg-theme-primary-20 border-2 border-blue-300 dark:border-theme-primary-700"
                          : "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900",
                        isLoading ? "opacity-50" : ""
                      )
                    }

                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                            w-10 h-10 rounded-lg bg-theme-primary-500 dark:bg-theme-primary-600
                            flex items-center justify-center
                            ${isSelected ? "ring-2 ring-theme-primary-200 dark:ring-theme-primary-700" : ""}
                          `}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                {flowOption.title}
                              </h3>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {flowOption.description}
                            </p>

                            <div className="space-y-1">
                              {flowOption.benefits.map((benefit, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                                >
                                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                  <span>{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {isSelected ? (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>Select</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          )}

                          {!isSelected && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                handleChangeFlow(
                                  index === 0
                                    ? PaymentFlow.PAY_AT_END
                                    : PaymentFlow.PAY_AT_START
                                )
                              }
                              disabled={isLoading}
                              className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors"
                            >
                              {isLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3 h-3" />
                              )}
                              <span className="ml-1">Change</span>
                            </Button>
                          )}

                          {isSelected && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleChangeFlow(
                                  flowOption.flow === PaymentFlow.PAY_AT_START
                                    ? PaymentFlow.PAY_AT_END
                                    : PaymentFlow.PAY_AT_START
                                )
                              }
                              disabled={isLoading}
                              className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              {isLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3 h-3" />
                              )}
                              <span className="ml-1">Switch</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </ModalBody>

            <ModalFooter className="flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Your selection will be saved automatically
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  size="sm"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Done
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
