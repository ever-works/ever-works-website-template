"use client";

import { useTranslations } from 'next-intl';

interface MonetizationMethod {
  title: string;
  icon: string;
  description: string;
  color: string;
  hoverColor: string;
}

export function MonetizationSection() {
  const t = useTranslations('help');

const monetizationMethods: MonetizationMethod[] = [
  {
      title: t('MONETIZATION_AFFILIATION_TITLE'),
    icon: "🤑",
      description: t('MONETIZATION_AFFILIATION_DESC'),
    color: "from-theme-primary-100 to-theme-primary-200 dark:from-theme-primary-800 dark:to-theme-primary-900",
    hoverColor: "hover:from-theme-primary-200 hover:to-theme-primary-300 dark:hover:from-theme-primary-700 dark:hover:to-theme-primary-800",
  },
  {
      title: t('MONETIZATION_PAID_SUBMISSION_TITLE'),
    icon: "💰",
      description: t('MONETIZATION_PAID_SUBMISSION_DESC'),
    color: "from-theme-secondary-100 to-theme-secondary-200 dark:from-theme-secondary-800 dark:to-theme-secondary-900",
    hoverColor: "hover:from-theme-secondary-200 hover:to-theme-secondary-300 dark:hover:from-theme-secondary-700 dark:hover:to-theme-secondary-800",
  },
  {
      title: t('MONETIZATION_SPONSORED_ADS_TITLE'),
    icon: "🎯",
      description: t('MONETIZATION_SPONSORED_ADS_DESC'),
    color: "from-theme-accent-100 to-theme-accent-200 dark:from-theme-accent-800 dark:to-theme-accent-900",
    hoverColor: "hover:from-theme-accent-200 hover:to-theme-accent-300 dark:hover:from-theme-accent-700 dark:hover:to-theme-accent-800",
  },
];

  return (
    <section className="py-20 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
      <div>
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-theme-primary-600 dark:text-theme-primary-400 text-sm font-medium tracking-wider uppercase mb-4">
            MONETIZATION
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('MONETIZATION_SECTION_TITLE')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            {t('MONETIZATION_SECTION_SUBTITLE')}
          </p>
        </div>

        {/* Monetization Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {monetizationMethods.map((method, index) => (
            <div
              key={method.title}
              className={`group transition-all duration-300 hover:scale-105 ${
                index === 0
                  ? "animate-fade-in"
                  : index === 1
                    ? "animate-fade-in [animation-delay:200ms]"
                    : "animate-fade-in [animation-delay:400ms]"
              }`}
            >
              <div
                className={`bg-gradient-to-br ${method.color} ${method.hoverColor} p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 h-full shadow-lg hover:shadow-xl relative`}
              >
                {/* Icon */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {method.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {method.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                  {method.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-theme-primary-500/10 to-theme-secondary-500/10 dark:from-theme-primary-400/10 dark:to-theme-secondary-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-theme-primary-50 to-theme-secondary-50 dark:from-theme-primary-900/20 dark:to-theme-secondary-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Ready to Monetize</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Our platform comes with built-in revenue generation features and payment
              integrations ready to use
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-theme-secondary-600 dark:text-theme-secondary-400">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Stripe Integration</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-theme-secondary-600 dark:text-theme-secondary-400">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Affiliate System</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-theme-secondary-600 dark:text-theme-secondary-400">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Ad Management</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-theme-secondary-600 dark:text-theme-secondary-400">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Revenue Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
