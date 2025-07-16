import { useTranslations } from 'next-intl';

export function Support() {
  const t = useTranslations("help");
  return (
    <div>
      {/* Support Section */}
      <section
        id="support"
        className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-300/50 dark:border-gray-800/50 shadow-2xl transition-all duration-300"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🆘 {t("NEED_HELP")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">{t("NEED_HELP_DESC")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Documentation */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("DOCUMENTATION")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t("DOCUMENTATION_DESC")}</p>
              <a
                href="/docs"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-300"
              >
                {t("VIEW_DOCUMENTATION")}
              </a>
            </div>

            {/* Community */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("COMMUNITY")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t("COMMUNITY_DESC")}</p>
              <a
                href="https://discord.gg/ever-works"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors duration-300"
              >
                {t("JOIN_DISCORD")}
              </a>
            </div>

            {/* Contact */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("CONTACT_SUPPORT")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t("CONTACT_SUPPORT_DESC")}
              </p>
              <a
                href="mailto:support@ever.works"
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors duration-300"
              >
                {t("EMAIL_SUPPORT")}
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12 bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 border border-gray-300/50 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              ❓ {t("FAQ")}
            </h3>
            <div className="space-y-4">
              <div className="transition-all duration-300">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t("FAQ_SETUP_TIME")}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {t("FAQ_SETUP_TIME_ANSWER")}
                </p>
              </div>
              <div className="transition-all duration-300">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t("FAQ_CODING_EXPERIENCE")}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {t("FAQ_CODING_EXPERIENCE_ANSWER")}
                </p>
              </div>
              <div className="transition-all duration-300">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t("FAQ_CUSTOMIZE_DESIGN")}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {t("FAQ_CUSTOMIZE_DESIGN_ANSWER")}
                </p>
              </div>
              <div className="transition-all duration-300">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t("FAQ_HOSTING")}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {t("FAQ_HOSTING_ANSWER")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}