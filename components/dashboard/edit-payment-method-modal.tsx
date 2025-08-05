"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { type PaymentMethodData, usePaymentMethods } from "@/hooks/use-payment-methods";

interface EditPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethodData | null;
  onEdit: (paymentMethod: PaymentMethodData) => void;
}

export function EditPaymentMethodModal({
  isOpen,
  onClose,
  paymentMethod,
  onEdit
}: EditPaymentMethodModalProps) {
  const t = useTranslations("billing");
  const { updatePaymentMethodAsync } = usePaymentMethods();

  const [formData, setFormData] = useState({
    holderName: "",
    expiryMonth: "",
    expiryYear: "",
    isDefault: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        holderName: paymentMethod.billing_details?.name || "",
        expiryMonth: paymentMethod.card?.exp_month?.toString() || "",
        expiryYear: paymentMethod.card?.exp_year?.toString() || "",
        isDefault: paymentMethod.is_default || false
      });
    }
  }, [paymentMethod]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.holderName.trim()) {
      newErrors.holderName = t("VALIDATION_CARDHOLDER_REQUIRED");
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !paymentMethod) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const updateData = {
        billing_details: {
          name: formData.holderName
        },
        card: {
          exp_month: parseInt(formData.expiryMonth),
          exp_year: parseInt(formData.expiryYear)
        },
        set_as_default: formData.isDefault
      };

      const updatedPaymentMethod = await updatePaymentMethodAsync({
        paymentMethodId: paymentMethod.id,
        updateData
      });

      onEdit(updatedPaymentMethod);
      onClose();
      setErrors({});
    } catch (error: any) {
      console.error("Error updating payment method:", error);
      setApiError(error.message || "Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!paymentMethod) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        {/* Non-editable information display */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-6 bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 rounded flex items-center justify-center text-white text-sm font-bold">
              💳
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {paymentMethod.card?.brand} •••• {paymentMethod.card?.last4}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("CARD_NUMBER_NOT_EDITABLE")}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{apiError}</p>
            </div>
          )}

          <div>
            <label htmlFor="holderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("CARD_HOLDER_NAME")}
            </label>
            <input
              id="holderName"
              type="text"
              value={formData.holderName}
              onChange={(e) => handleInputChange("holderName", e.target.value)}
              placeholder="John Doe"
              className={`w-full h-12 px-4 pr-12 bg-transparent border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.holderName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-300 focus:border-theme-primary-10 focus:ring-theme-primary-10"
              }`}
            />
            {errors.holderName && (
              <p className="text-red-500 text-xs mt-1">{errors.holderName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("EXPIRY_MONTH")}
              </label>
              <input
                id="expiryMonth"
                type="number"
                value={formData.expiryMonth}
                onChange={(e) => handleInputChange("expiryMonth", e.target.value)}
                placeholder="MM"
                min="1"
                max="12"
                className={`w-full h-12 px-4 pr-10 text-center bg-transparent border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                  errors.expiryMonth
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-theme-primary-10 focus:ring-theme-primary-10"
                  }`}
              />
              {errors.expiryMonth && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryMonth}</p>
              )}
            </div>

            <div>
              <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("EXPIRY_YEAR")}
              </label>
              <input
                id="expiryYear"
                type="number"
                value={formData.expiryYear}
                onChange={(e) => handleInputChange("expiryYear", e.target.value)}
                placeholder="YYYY"
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 20}
                maxLength={4}
                className={`w-full h-12 px-4 pr-10 text-center bg-transparent border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                  errors.expiryYear
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-theme-primary-10 focus:ring-theme-primary-10"
                  }`}
              />
              {errors.expiryYear && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryYear}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isDefault"
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded border-gray-300 text-theme-primary-600 focus:ring-blue-500"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">
              {t("SET_AS_DEFAULT_PAYMENT")}
            </label>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-theme-primary-700 dark:text-blue-300">
              <Lock className="h-4 w-4" />
              <span>{t("SECURITY_NOTICE")}</span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t("CANCEL")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-theme-primary-500 hover:bg-theme-primary-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
