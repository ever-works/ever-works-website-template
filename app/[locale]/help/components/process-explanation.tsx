import { useTranslations } from 'next-intl';

export const ProcessExplanation = () => {
  const t = useTranslations('help');
  return (
    <div className="mt-12 bg-gradient-to-r from-theme-primary-50 to-theme-secondary-50 dark:from-theme-primary-900/20 dark:to-theme-secondary-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center transition-colors duration-300">
        🔄 {t('HOW_IT_WORKS_PROCESS_TITLE')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center group">
          <div className="w-12 h-12 bg-theme-primary-500 dark:bg-theme-primary-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold">1</span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-theme-primary-600 dark:group-hover:text-theme-primary-400">
            {t('HOW_IT_WORKS_PROCESS_STEP1')}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
            {t('HOW_IT_WORKS_PROCESS_STEP1_DESC')}
          </p>
        </div>
        <div className="text-center group">
          <div className="w-12 h-12 bg-theme-secondary-500 dark:bg-theme-secondary-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold">2</span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-theme-secondary-600 dark:group-hover:text-theme-secondary-400">
            {t('HOW_IT_WORKS_PROCESS_STEP2')}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
            {t('HOW_IT_WORKS_PROCESS_STEP2_DESC')}
          </p>
        </div>
        <div className="text-center group">
          <div className="w-12 h-12 bg-theme-accent-500 dark:bg-theme-accent-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold">3</span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-theme-accent-600 dark:group-hover:text-theme-accent-400">
            {t('HOW_IT_WORKS_PROCESS_STEP3')}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
            {t('HOW_IT_WORKS_PROCESS_STEP3_DESC')}
          </p>
        </div>
        <div className="text-center group">
          <div className="w-12 h-12 bg-orange-500 dark:bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold">4</span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
            {t('HOW_IT_WORKS_PROCESS_STEP4')}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
            {t('HOW_IT_WORKS_PROCESS_STEP4_DESC')}
          </p>
        </div>
      </div>
    </div>
  )
}

