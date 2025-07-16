import { HowItWorks, InstallationGuide, UsageGuide, TechStack, MonetizationSection, HeroLanding } from "./components";
import { useTranslations } from 'next-intl';

export default function HelpPage() {
  const t = useTranslations('help');
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <HeroLanding />

        {/* Table of Contents */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            📋 {t('TABLE_OF_CONTENTS')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="#quick-start"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-blue-400 text-2xl">🚀</span>
              <div>
                <h3 className="font-semibold text-white">{t('QUICK_START')}</h3>
                <p className="text-gray-400 text-sm">{t('QUICK_START_DESC')}</p>
              </div>
            </a>
            <a
              href="#installation"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-green-400 text-2xl">📚</span>
              <div>
                <h3 className="font-semibold text-white">{t('INSTALLATION')}</h3>
                <p className="text-gray-400 text-sm">{t('INSTALLATION_DESC')}</p>
              </div>
            </a>
            <a
              href="#usage"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-purple-400 text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-white">{t('USAGE_GUIDE')}</h3>
                <p className="text-gray-400 text-sm">{t('USAGE_GUIDE_DESC')}</p>
              </div>
            </a>
            <a
              href="#tech-stack"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-cyan-400 text-2xl">🔧</span>
              <div>
                <h3 className="font-semibold text-white">{t('TECH_STACK')}</h3>
                <p className="text-gray-400 text-sm">{t('TECH_STACK_DESC')}</p>
              </div>
            </a>
            <a
              href="#monetization"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-yellow-400 text-2xl">💰</span>
              <div>
                <h3 className="font-semibold text-white">{t('MONETIZATION')}</h3>
                <p className="text-gray-400 text-sm">{t('MONETIZATION_DESC')}</p>
              </div>
            </a>
            <a
              href="#support"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-pink-400 text-2xl">🆘</span>
              <div>
                <h3 className="font-semibold text-white">{t('SUPPORT')}</h3>
                <p className="text-gray-400 text-sm">{t('SUPPORT_DESC')}</p>
              </div>
            </a>
          </div>
        </div>

        {/* Quick Start Section */}
        <section id="quick-start">
          <HowItWorks />
        </section>

        {/* Installation Guide Section */}
        <section id="installation">
          <InstallationGuide />
        </section>

        {/* Usage Guide Section */}
        <section id="usage">
          <UsageGuide />
        </section>


        {/* Tech Stack Section */}
        <section id="tech-stack">
          <TechStack />
        </section>

        {/* Monetization Section */}
        <section id="monetization">
          <MonetizationSection />
        </section>

        {/* Support Section */}
        <section id="support" className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                🆘 {t('NEED_HELP')}
              </h2>
              <p className="text-gray-400 text-lg">
                {t('NEED_HELP_DESC')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Documentation */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('DOCUMENTATION')}</h3>
                <p className="text-gray-400 mb-4">
                  {t('DOCUMENTATION_DESC')}
                </p>
                <a 
                  href="/docs" 
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {t('VIEW_DOCUMENTATION')}
                </a>
              </div>

              {/* Community */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('COMMUNITY')}</h3>
                <p className="text-gray-400 mb-4">
                  {t('COMMUNITY_DESC')}
                </p>
                <a 
                  href="https://discord.gg/ever-works" 
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  {t('JOIN_DISCORD')}
                </a>
              </div>

              {/* Contact */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('CONTACT_SUPPORT')}</h3>
                <p className="text-gray-400 mb-4">
                  {t('CONTACT_SUPPORT_DESC')}
                </p>
                <a 
                  href="mailto:support@ever.works" 
                  className="text-green-400 hover:text-green-300 font-medium"
                >
                  {t('EMAIL_SUPPORT')}
                </a>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-12 bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">❓ {t('FAQ')}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">{t('FAQ_SETUP_TIME')}</h4>
                  <p className="text-gray-400 text-sm">
                    {t('FAQ_SETUP_TIME_ANSWER')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">{t('FAQ_CODING_EXPERIENCE')}</h4>
                  <p className="text-gray-400 text-sm">
                    {t('FAQ_CODING_EXPERIENCE_ANSWER')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">{t('FAQ_CUSTOMIZE_DESIGN')}</h4>
                  <p className="text-gray-400 text-sm">
                    {t('FAQ_CUSTOMIZE_DESIGN_ANSWER')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">{t('FAQ_HOSTING')}</h4>
                  <p className="text-gray-400 text-sm">
                    {t('FAQ_HOSTING_ANSWER')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}