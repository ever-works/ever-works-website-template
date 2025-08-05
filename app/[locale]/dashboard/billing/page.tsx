"use client";

import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/ui/container";
import { BillingSection } from "@/components/dashboard/billing-section";

export default function DashboardBillingPage() {
  const t = useTranslations("billing");
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <PageContainer className="py-12">
    <div className="space-y-8">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {t("TITLE")} - Dashboard
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        {t("SUBTITLE")}
      </p>
    </div>

    <BillingSection />

    <div className="bg-theme-primary-50 dark:bg-theme-primary-10 border border-theme-primary-200 dark:border-theme-primary-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-theme-primary-900 dark:text-theme-primary-100 mb-3">
        {t("FEATURES_INCLUDED")}
      </h3>
      <ul className="space-y-2 text-theme-primary-800 dark:text-theme-primary-200">
        <li className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-theme-primatext-theme-primary-500 rounded-full"></span>
          <span>{t("FEATURE_PAYMENT_DISPLAY")}</span>
        </li>
        <li className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-theme-primatext-theme-primary-500 rounded-full"></span>
          <span>{t("FEATURE_LAST_DIGITS")}</span>
        </li>
        <li className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-theme-primatext-theme-primary-500 rounded-full"></span>
          <span>{t("FEATURE_EDIT_DELETE")}</span>
        </li>
        <li className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-theme-primatext-theme-primary-500 rounded-full"></span>
          <span>{t("FEATURE_ADD_MODAL")}</span>
        </li>
        <li className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-theme-primatext-theme-primary-500 rounded-full"></span>
          <span>{t("FEATURE_DEFAULT_MANAGEMENT")}</span>
        </li>
        <li className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-theme-primatext-theme-primary-500 rounded-full"></span>
          <span>{t("FEATURE_EXPIRY_ALERTS")}</span>
        </li>
        <li className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-blue-500 text-blue-500 rounded-full"></span>
          <span>{t("FEATURE_RESPONSIVE")}</span>
        </li>
      </ul>
    </div>
  </div>
  </PageContainer>
  </div>
  );
}
