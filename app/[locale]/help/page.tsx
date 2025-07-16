import { PageContainer } from "@/components/ui/container";
import {
  HowItWorks,
  InstallationGuide,
  UsageGuide,
  TechStack,
  MonetizationSection,
  HeroLanding, Support
} from "./components";
import { useTranslations } from "next-intl";

export default function HelpPage() {
  const t = useTranslations("help");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-all duration-300">
      {/* Hero Section */}
      <HeroLanding />
      <PageContainer className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Table of Contents */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            📋 {t("TABLE_OF_CONTENTS")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="#quick-start"
              className="flex items-center space-x-3 p-4 bg-gray-50/80 dark:bg-gray-800/70 rounded-lg hover:bg-gray-100/90 dark:hover:bg-gray-700/80 transition-all duration-300 border border-gray-200/70 dark:border-gray-600/70 hover:border-gray-300 dark:hover:border-gray-500 group hover:shadow-md dark:hover:shadow-lg"
            >
              <span className="text-theme-primary-500 dark:text-theme-primary-400 text-2xl group-hover:scale-110 transition-transform duration-300">🚀</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("QUICK_START")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t("QUICK_START_DESC")}</p>
              </div>
            </a>
            <a
              href="#installation"
              className="flex items-center space-x-3 p-4 bg-gray-50/80 dark:bg-gray-800/70 rounded-lg hover:bg-gray-100/90 dark:hover:bg-gray-700/80 transition-all duration-300 border border-gray-200/70 dark:border-gray-600/70 hover:border-gray-300 dark:hover:border-gray-500 group hover:shadow-md dark:hover:shadow-lg"
            >
              <span className="text-theme-secondary-500 dark:text-theme-secondary-400 text-2xl group-hover:scale-110 transition-transform duration-300">📚</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("INSTALLATION")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {t("INSTALLATION_DESC")}
                </p>
              </div>
            </a>
            <a
              href="#usage"
              className="flex items-center space-x-3 p-4 bg-gray-50/80 dark:bg-gray-800/70 rounded-lg hover:bg-gray-100/90 dark:hover:bg-gray-700/80 transition-all duration-300 border border-gray-200/70 dark:border-gray-600/70 hover:border-gray-300 dark:hover:border-gray-500 group hover:shadow-md dark:hover:shadow-lg"
            >
              <span className="text-theme-accent-500 dark:text-theme-accent-400 text-2xl group-hover:scale-110 transition-transform duration-300">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t("USAGE_GUIDE")}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t("USAGE_GUIDE_DESC")}</p>
              </div>
            </a>
            <a
              href="#tech-stack"
              className="flex items-center space-x-3 p-4 bg-gray-50/80 dark:bg-gray-800/70 rounded-lg hover:bg-gray-100/90 dark:hover:bg-gray-700/80 transition-all duration-300 border border-gray-200/70 dark:border-gray-600/70 hover:border-gray-300 dark:hover:border-gray-500 group hover:shadow-md dark:hover:shadow-lg"
            >
              <span className="text-theme-primary-600 dark:text-theme-primary-300 text-2xl group-hover:scale-110 transition-transform duration-300">🔧</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t("TECH_STACK")}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t("TECH_STACK_DESC")}</p>
              </div>
            </a>
            <a
              href="#monetization"
              className="flex items-center space-x-3 p-4 bg-gray-50/80 dark:bg-gray-800/70 rounded-lg hover:bg-gray-100/90 dark:hover:bg-gray-700/80 transition-all duration-300 border border-gray-200/70 dark:border-gray-600/70 hover:border-gray-300 dark:hover:border-gray-500 group hover:shadow-md dark:hover:shadow-lg"
            >
              <span className="text-theme-secondary-600 dark:text-theme-secondary-300 text-2xl group-hover:scale-110 transition-transform duration-300">💰</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("MONETIZATION")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {t("MONETIZATION_DESC")}
                </p>
              </div>
            </a>
            <a
              href="#support"
              className="flex items-center space-x-3 p-4 bg-gray-50/80 dark:bg-gray-800/70 rounded-lg hover:bg-gray-100/90 dark:hover:bg-gray-700/80 transition-all duration-300 border border-gray-200/70 dark:border-gray-600/70 hover:border-gray-300 dark:hover:border-gray-500 group hover:shadow-md dark:hover:shadow-lg"
            >
              <span className="text-theme-accent-600 dark:text-theme-accent-300 text-2xl group-hover:scale-110 transition-transform duration-300">🆘</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t("SUPPORT")}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t("SUPPORT_DESC")}</p>
              </div>
            </a>
          </div>
        </div>

        {/* Quick Start Section */}
        <section id="quick-start" className="transition-all duration-300">
          <HowItWorks />
        </section>

        {/* Installation Guide Section */}
        <section id="installation" className="transition-all duration-300">
          <InstallationGuide />
        </section>

        {/* Usage Guide Section */}
        <section id="usage" className="transition-all duration-300">
          <UsageGuide />
        </section>

        {/* Tech Stack Section */}
        <section id="tech-stack" className="transition-all duration-300">
          <TechStack />
        </section>

        {/* Monetization Section */}
        <section id="monetization" className="transition-all duration-300">
          <MonetizationSection />
        </section>

        <section id="support" className="transition-all duration-300">
          <Support />
        </section>
      </PageContainer>
    </div>
  );
}
