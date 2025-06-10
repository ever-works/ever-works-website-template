export function Newsletter({ t }: { t: any }) {
  return (
    <div
      className="space-y-3 sm:space-y-4 animate-fade-in-up"
      style={{ animationDelay: "0.4s" }}
    >
      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
        {t("footer.STAY_UPDATED")}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t("footer.NEWSLETTER_DESCRIPTION")}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder={t("footer.ENTER_EMAIL")}
          className="flex-1 px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-white/30 dark:border-gray-700/40 focus:border-blue-300/50 dark:focus:border-blue-500/30 focus:outline-none transition-all duration-300 text-sm placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button className="mt-2 sm:mt-0 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 text-sm">
          {t("footer.SUBSCRIBE")}
        </button>
      </div>
    </div>
  );
}
