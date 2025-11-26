"use client";

import { PaymentFlow } from "@/lib/payment/types/payment";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Card,
  useDisclosure
} from "@heroui/react";
import {
  CreditCard,
  Clock,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFlowSelectorModalProps {
  selectedFlow: PaymentFlow;
  title?: string;
}

export function PaymentFlowSelectorModal({
  selectedFlow,
  title = "Payment Flow Explanation",
}: PaymentFlowSelectorModalProps) {
  const { isOpen, onClose } = useDisclosure();

  const flows = [
    {
      flow: PaymentFlow.PAY_AT_START,
      title: "Pay Now",
      description: "Payment required before submission. Your payment will be processed immediately when you select this option.",
      icon: CreditCard,
      gradient: "from-theme-primary-500 to-theme-primary-600",
      benefits: ["Immediate processing", "Priority review", "Faster approval"],
    },
    {
      flow: PaymentFlow.PAY_AT_END,
      title: "Pay Later",
      description: "Payment after approval. You'll only be charged once your submission is approved and published.",
      icon: Clock,
      gradient: "from-theme-primary-500 to-theme-primary-600",
      benefits: ["No upfront cost", "Review before payment", "Risk-free trial"],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        base: "border-0 shadow-lg bg-white dark:bg-gray-900",
        backdrop: "bg-black/50",
        wrapper: "p-4",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center justify-between pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Learn about payment options
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-4">
              {flows.map((flowOption) => {
                const IconComponent = flowOption.icon;
                const isSelected = selectedFlow === flowOption.flow;

                return (
                  <Card
                    key={flowOption.flow}
                    className={cn(
                      "transition-all duration-300",
                      isSelected
                        ? "bg-blue-50 dark:bg-theme-primary-20 border-2 border-blue-300 dark:border-theme-primary-700"
                        : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    )}
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
                                  <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                                  <span>{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                              {flowOption.title}
                            </h3>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {flowOption.description}
                          </p>

                          <div className="space-y-1">
                            {flowOption.benefits.map((benefit, index) => (
                              <div
                                key={`${flowOption.flow}-${index}`}
                                className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                              >
                                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
