"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  Lock, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PaymentMethod } from "./billing-section";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (paymentMethod: Omit<PaymentMethod, "id" | "createdAt">) => void;
}

export function AddPaymentMethodModal({
  isOpen,
  onClose,
  onAdd
}: AddPaymentMethodModalProps) {
  const t = useTranslations("billing");
  const [formData, setFormData] = useState({
    holderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
    isDefault: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validFields, setValidFields] = useState<Set<string>>(new Set());

  const detectCardType = (cardNumber: string): PaymentMethod["type"] => {
    const number = cardNumber.replace(/\s/g, "");
    if (number.startsWith("4")) return "visa";
    if (number.startsWith("5") || number.startsWith("2")) return "mastercard";
    if (number.startsWith("3")) return "amex";
    if (number.startsWith("6")) return "discover";
    return "other";
  };

  const getCardBrand = (type: PaymentMethod["type"]): string => {
    switch (type) {
      case "visa": return "Visa";
      case "mastercard": return "Mastercard";
      case "amex": return "American Express";
      case "discover": return "Discover";
      default: return "Carte";
    }
  };

  const formatCardNumber = (value: string) => {
    const number = value.replace(/\s/g, "").replace(/\D/g, "");
    const type = detectCardType(number);
    if (type === "amex") {
      return number.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3").trim();
    } else {
      return number.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    }
  };


  const isFieldValid = (field: string, value: string) => {
    switch (field) {
      case "holderName":
        return value.trim().length >= 2;
      case "cardNumber":
        const cleanNumber = value.replace(/\s/g, "");
        return cleanNumber.length >= 13 && cleanNumber.length <= 19;
      case "expiryMonth":
        const month = parseInt(value);
        return month >= 1 && month <= 12;
      case "expiryYear":
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        return year >= currentYear && year <= currentYear + 20;
      case "cvc":
        return value.length >= 3 && value.length <= 4;
      default:
        return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.holderName.trim()) {
      newErrors.holderName = t("VALIDATION_CARDHOLDER_REQUIRED");
    }

    const cardNumber = formData.cardNumber.replace(/\s/g, "");
    if (!cardNumber) {
      newErrors.cardNumber = t("VALIDATION_CARD_NUMBER_REQUIRED");
    } else if (cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.cardNumber = t("VALIDATION_INVALID_CARD");
    }

    if (!formData.expiryMonth) {
      newErrors.expiryMonth = t("VALIDATION_EXPIRY_MONTH_REQUIRED");
    } else if (parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) {
      newErrors.expiryMonth = t("VALIDATION_INVALID_MONTH");
    }

    if (!formData.expiryYear) {
      newErrors.expiryYear = t("VALIDATION_EXPIRY_YEAR_REQUIRED");
    } else {
      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.expiryYear);
      if (year < currentYear || year > currentYear + 20) {
        newErrors.expiryYear = t("VALIDATION_INVALID_YEAR");
      }
    }

    if (!formData.cvc) {
      newErrors.cvc = t("VALIDATION_CVC_REQUIRED");
    } else if (formData.cvc.length < 3 || formData.cvc.length > 4) {
      newErrors.cvc = t("VALIDATION_INVALID_CVC");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const cardNumber = formData.cardNumber.replace(/\s/g, "");
      const type = detectCardType(cardNumber);
      const brand = getCardBrand(type);

      const newPaymentMethod: Omit<PaymentMethod, "id" | "createdAt"> = {
        type,
        brand,
        last4: cardNumber.slice(-4),
        expiryMonth: parseInt(formData.expiryMonth),
        expiryYear: parseInt(formData.expiryYear),
        holderName: formData.holderName,
        isDefault: formData.isDefault
      };

      onAdd(newPaymentMethod);
      
      // Reset form
      setFormData({
        holderName: "",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvc: "",
        isDefault: false
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding payment method:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    if (field === "cardNumber") {
      processedValue = formatCardNumber(value);
    } else if (field === "cvc") {
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (field === "expiryMonth") {
      processedValue = value.replace(/\D/g, "").slice(0, 2);
    } else if (field === "expiryYear") {
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (field === "holderName") {
      processedValue = value.replace(/[^a-zA-Z\s'-]/g, "");
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    const newValidFields = new Set(validFields);
    if (isFieldValid(field, processedValue)) {
      newValidFields.add(field);
    } else {
      newValidFields.delete(field);
    }
    setValidFields(newValidFields);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="relative overflow-hidden">

        <div className="p-8 bg-white dark:bg-gray-900">

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="group">
            <label htmlFor="holderName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t("CARD_HOLDER_NAME")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                id="holderName"
                type="text"
                value={formData.holderName}
                onChange={(e) => handleInputChange("holderName", e.target.value)}
                placeholder={t("CARD_HOLDER_NAME_PLACEHOLDER")}
                className={`w-full h-12 px-4 pr-12 bg-transparent border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                  errors.holderName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-theme-primary-10 focus:ring-theme-primary-10"
                }`}
              />

              {validFields.has("holderName") && !errors.holderName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.holderName && (
              <p className="mt-2 text-red-500 text-sm">{errors.holderName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cardNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t("CARD_NUMBER")}
            </label>
            <div className="relative">
              <input
                id="cardNumber"
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                placeholder={t("CARD_NUMBER_PLACEHOLDER")}
                maxLength={23}
                className={`w-full h-12 px-4 pr-16 font-mono bg-transparent border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                  errors.cardNumber
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-theme-primary-10 focus:ring-theme-primary-10"
                }`}
              />

              {/* Simple indicators */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {validFields.has("cardNumber") && !errors.cardNumber && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}

                {/* Card type */}
                {(() => {
                  const cardType = detectCardType(formData.cardNumber);
                  const cardColors = {
                    visa: "text-blue-600",
                    mastercard: "text-red-600",
                    amex: "text-green-600",
                    discover: "text-orange-600",
                    other: "text-gray-400"
                  };
                  return (
                    <CreditCard className={`h-5 w-5 ${cardColors[cardType]}`} />
                  );
                })()}
              </div>
            </div>

            {/* Simple error message */}
            {errors.cardNumber && (
              <p className="mt-2 text-red-500 text-sm">{errors.cardNumber}</p>
            )}
          </div>

          {/* Expiry date and CVC */}
          <div className="grid grid-cols-3 gap-4">
            {/* Expiry month */}
            <div className="space-y-2">
              <label htmlFor="expiryMonth" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("EXPIRY_MONTH")}
              </label>
              <div className="relative">
                <input
                  id="expiryMonth"
                  type="text"
                  value={formData.expiryMonth}
                  onChange={(e) => handleInputChange("expiryMonth", e.target.value)}
                  placeholder={t("EXPIRY_MONTH_PLACEHOLDER")}
                  maxLength={2}
                  className={`w-full h-12 px-4 pr-10 text-center bg-transparent border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.expiryMonth
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-theme-primary-10 focus:ring-theme-primary-10"
                    }`}
                />
                {validFields.has("expiryMonth") && !errors.expiryMonth && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              {errors.expiryMonth && (
                <p className="text-red-500 text-xs">{errors.expiryMonth}</p>
              )}
            </div>

            {/* Expiry year */}
            <div className="space-y-2">
              <label htmlFor="expiryYear" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("EXPIRY_YEAR")}
              </label>
              <div className="relative">
                <input
                  id="expiryYear"
                  type="text"
                  value={formData.expiryYear}
                  onChange={(e) => handleInputChange("expiryYear", e.target.value)}
                  placeholder={t("EXPIRY_YEAR_PLACEHOLDER")}
                  maxLength={4}
                  className={`w-full h-12 px-4 pr-10 text-center bg-transparent border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.expiryYear
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-theme-primary-10 focus:ring-theme-primary-10"
                    }`}
                />
                {validFields.has("expiryYear") && !errors.expiryYear && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              {errors.expiryYear && (
                <p className="text-red-500 text-xs">{errors.expiryYear}</p>
              )}
            </div>

            {/* CVC */}
            <div className="space-y-2">
              <label htmlFor="cvc" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("CVC")}
              </label>
              <div className="relative">
                <input
                  id="cvc"
                  type="text"
                  value={formData.cvc}
                  onChange={(e) => handleInputChange("cvc", e.target.value)}
                  placeholder={t("CVC_PLACEHOLDER")}
                  maxLength={4}
                  className={`w-full h-12 px-4 pr-12 text-center bg-transparent border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.cvc
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-theme-primary-10 focus:ring-theme-primary-10"
                    }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  {validFields.has("cvc") && !errors.cvc && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <div className="w-6 h-4 bg-gray-200 rounded text-xs flex items-center justify-center text-gray-600">
                    ?
                  </div>
                </div>
              </div>
              {errors.cvc && (
                <p className="text-red-500 text-xs">{errors.cvc}</p>
              )}
            </div>
          </div>

          {/* Default checkbox */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <input
              id="isDefault"
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded border-gray-300 text-theme-primary-600 focus:ring-theme-primary-500"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              {t("SET_AS_DEFAULT_PAYMENT")}
            </label>
          </div>

          {/* Security message */}
          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">
              {t("PAYMENT_INFO_SECURED")}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              {t("CANCEL")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-theme-primary-600 hover:bg-theme-primary-700"
            >
              {isSubmitting ? t("ADDING_CARD") : t("ADD_CARD_BUTTON")}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </Modal>
  );
}
