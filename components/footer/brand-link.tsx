import Link from "next/link";
import { IconEverworksSimple } from "../icons";

/**
 * Enhanced Brand link component
 */
export function BrandLink({ t }: { t: any }) {
    return (
      <div
        className="space-y-5 sm:space-y-6 animate-fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >
        <Link
          href="https://ever.works"
          className="group inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-900/40 backdrop-blur-lg border border-gray-200 dark:border-gray-700/40 hover:border-blue-300/50 dark:hover:border-blue-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-105 w-fit"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
              {t("footer.BUILT_WITH")}
            </span>
            <div className="relative w-5 h-5">
              <IconEverworksSimple className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-sm  text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
              Works
            </span>
          </div>
        </Link>
      </div>
    );
  }
  