"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentMethodCard } from "./payment-method-card";
import { AddPaymentMethodModal } from "./add-payment-method-modal";
import { EditPaymentMethodModal } from "./edit-payment-method-modal";
import { DeletePaymentMethodModal } from "./delete-payment-method-modal";

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex" | "discover" | "other";
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  brand: string;
  createdAt: string;
}

interface BillingSectionProps {
  className?: string;
}

export function BillingSection({ className }: BillingSectionProps) {
  const t = useTranslations("billing");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // Simuler le chargement des méthodes de paiement
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Données de démonstration
        const mockPaymentMethods: PaymentMethod[] = [
          {
            id: "pm_1",
            type: "visa",
            last4: "4242",
            expiryMonth: 12,
            expiryYear: 2025,
            holderName: "John Doe",
            isDefault: true,
            brand: "Visa",
            createdAt: "2024-01-15T10:30:00Z"
          },
          {
            id: "pm_2",
            type: "mastercard",
            last4: "5555",
            expiryMonth: 8,
            expiryYear: 2026,
            holderName: "John Doe",
            isDefault: false,
            brand: "Mastercard",
            createdAt: "2024-02-20T14:45:00Z"
          }
        ];
        
        setPaymentMethods(mockPaymentMethods);
      } catch (err) {
        setError(t("ERROR_LOADING_PAYMENT_METHODS"));
        console.error("Failed to fetch payment methods:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleAddPaymentMethod = (newMethod: Omit<PaymentMethod, "id" | "createdAt">) => {
    const paymentMethod: PaymentMethod = {
      ...newMethod,
      id: `pm_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    setPaymentMethods(prev => [...prev, paymentMethod]);
    setShowAddModal(false);
  };

  const handleEditPaymentMethod = (updatedMethod: PaymentMethod) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === updatedMethod.id ? updatedMethod : method
      )
    );
    setShowEditModal(false);
    setSelectedPaymentMethod(null);
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
    setShowDeleteModal(false);
    setSelectedPaymentMethod(null);
  };

  const handleEditClick = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowEditModal(true);
  };

  const handleDeleteClick = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowDeleteModal(true);
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("TITLE")}
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("TITLE")}
              </h2>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="flex items-center space-x-2 bg-theme-primary-500 hover:bg-theme-primary-500"
            >
              <Plus className="h-4 w-4" />
              <span>{t("ADD_CARD")}</span>
            </Button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {paymentMethods.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("NO_PAYMENT_METHODS")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("NO_PAYMENT_METHODS_DESC")}
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("ADD_FIRST_CARD")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t("PAYMENT_METHODS_REGISTERED")}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t("CARDS_REGISTERED", {
                    count: paymentMethods.length,
                    plural: paymentMethods.length > 1 ? 's' : ''
                  })}
                </span>
              </div>

              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  paymentMethod={method}
                  onEdit={() => handleEditClick(method)}
                  onDelete={() => handleDeleteClick(method)}
                  onSetDefault={() => handleSetDefault(method.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <AddPaymentMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPaymentMethod}
      />

      <EditPaymentMethodModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPaymentMethod(null);
        }}
        paymentMethod={selectedPaymentMethod}
        onEdit={handleEditPaymentMethod}
      />

      <DeletePaymentMethodModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPaymentMethod(null);
        }}
        paymentMethod={selectedPaymentMethod}
        onDelete={handleDeletePaymentMethod}
      />
    </>
  );
}
