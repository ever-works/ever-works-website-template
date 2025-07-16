"use client";

import { useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const monetizationMethods: MonetizationMethod[] = [
    {
      title: t('MONETIZATION_AFFILIATION_TITLE'),
      icon: "🤑",
      description: t('MONETIZATION_AFFILIATION_DESC'),
      color: "from-blue-900 to-blue-800",
      hoverColor: "hover:from-blue-800 hover:to-blue-700",
    },
    {
      title: t('MONETIZATION_PAID_SUBMISSION_TITLE'),
      icon: "💰",
      description: t('MONETIZATION_PAID_SUBMISSION_DESC'),
      color: "from-blue-900 to-blue-800",
      hoverColor: "hover:from-blue-800 hover:to-blue-700",
    },
    {
      title: t('MONETIZATION_SPONSORED_ADS_TITLE'),
      icon: "🎯",
      description: t('MONETIZATION_SPONSORED_ADS_DESC'),
      color: "from-blue-900 to-blue-800",
      hoverColor: "hover:from-blue-800 hover:to-blue-700",
    },
  ];

  return (
    <section className="py-20  text-white bg-gray-900 rounded-2xl p-8 border border-gray-800">
      <div>
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-blue-400 text-sm font-medium tracking-wider uppercase mb-4">
            MONETIZATION
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('MONETIZATION_SECTION_TITLE')}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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
                className={`bg-gradient-to-br ${method.color} ${method.hoverColor} p-8 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 h-full`}
              >
                {/* Icon */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {method.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {method.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-center leading-relaxed">
                  {method.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-2xl font-bold mb-4">Start Earning Today</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Our template comes with built-in monetization features and payment
              integrations ready to use
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Stripe Integration</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Affiliate System</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Ad Management</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Revenue Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
