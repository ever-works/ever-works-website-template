
import { useTranslations } from 'next-intl';

interface TechnologyCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  version?: string;
  color?: string;
  popularity?: "high" | "medium" | "low";
}

export function TechnologyCard({ 
  name, 
  description, 
  icon, 
  category, 
  version,
  color = "blue",
  popularity = "medium"
}: TechnologyCardProps) {
  const t = useTranslations('help');
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10";
      case "green":
        return "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 hover:shadow-green-500/10 dark:hover:shadow-green-400/10";
      case "purple":
        return "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10";
      case "orange":
        return "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800/30 dark:hover:to-orange-700/30 hover:shadow-orange-500/10 dark:hover:shadow-orange-400/10";
      case "pink":
        return "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800 text-pink-900 dark:text-pink-100 hover:from-pink-100 hover:to-pink-200 dark:hover:from-pink-800/30 dark:hover:to-pink-700/30 hover:shadow-pink-500/10 dark:hover:shadow-pink-400/10";
      case "yellow":
        return "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100 hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-800/30 dark:hover:to-yellow-700/30 hover:shadow-yellow-500/10 dark:hover:shadow-yellow-400/10";
      case "red":
        return "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/30 dark:hover:to-red-700/30 hover:shadow-red-500/10 dark:hover:shadow-red-400/10";
      case "gray":
        return "from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700/30 dark:hover:to-gray-600/30 hover:shadow-gray-500/10 dark:hover:shadow-gray-400/10";
      default:
        return "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10";
    }
  };

  const popularityStyles = {
    high: "ring-2 ring-yellow-400 dark:ring-yellow-500 ring-opacity-50",
    medium: "",
    low: "opacity-90"
  };

  const popularityBadge = {
    high: { text: t('TECH_CARD_POPULAR'), color: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200" },
    medium: { text: t('TECH_CARD_STABLE'), color: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200" },
    low: { text: t('TECH_CARD_NICHE'), color: "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200" }
  };

  return (
    <div className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${getColorClasses(color)} ${popularityStyles[popularity]}`}>
      {/* Popularity Badge */}
      <div className="absolute -top-2 -right-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${popularityBadge[popularity].color}`}>
          {popularityBadge[popularity].text}
        </span>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white dark:via-gray-400 to-transparent opacity-0 group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity duration-300"></div>

      <div className="relative flex items-start gap-4">
        {/* Icon with animated background */}
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 rounded-lg bg-white/80 dark:bg-gray-700/80 flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md transition-all duration-300">
            {icon}
          </div>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 dark:from-gray-600/20 to-transparent"></div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg leading-tight group-hover:text-opacity-80 transition-colors duration-300">
                {name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-70 transition-colors duration-300">
                  {category}
                </span>
                {version && (
                  <span className="text-xs px-2 py-1 bg-white/80 dark:bg-gray-600/80 rounded-full font-mono border border-white/50 dark:border-gray-500/50 transition-all duration-300">
                    v{version}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm opacity-80 leading-relaxed line-clamp-3 transition-colors duration-300">
            {description}
          </p>

          {/* Features/Tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {getFeatureTags(name).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 text-xs bg-white/60 dark:bg-gray-600/60 rounded-md border border-white/30 dark:border-gray-500/30 font-medium transition-all duration-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar (fake usage indicator) */}
      <div className="mt-4 relative">
        <div className="h-1 bg-white/50 dark:bg-gray-600/50 rounded-full overflow-hidden transition-colors duration-300">
          <div 
            className="h-full bg-gradient-to-r from-white to-white/80 dark:from-gray-300 dark:to-gray-400 transition-all duration-500 group-hover:from-white/90 group-hover:to-white dark:group-hover:from-gray-200 dark:group-hover:to-gray-300"
            style={{ width: `${getUsagePercentage(popularity)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs opacity-60 transition-colors duration-300">
          <span>{t('TECH_CARD_USAGE_IN_PROJECT')}</span>
          <span>{getUsagePercentage(popularity)}%</span>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getFeatureTags(name: string): string[] {
  const tags: Record<string, string[]> = {
    "React": ["Hooks", "JSX", "Virtual DOM"],
    "Next.js": ["SSR", "SSG", "API Routes"],
    "TypeScript": ["Type Safety", "Intellisense", "Compilation"],
    "Tailwind CSS": ["Utility-First", "Responsive", "Dark Mode"],
    "HeroUI": ["Components", "Theming", "Accessible"],
    "Drizzle ORM": ["Type-Safe", "Migration", "Query Builder"],
    "PostgreSQL": ["ACID", "Relational", "Scalable"],
    "Supabase": ["Real-time", "Auth", "Storage"],
    "NextAuth.js": ["OAuth", "Sessions", "Callbacks"],
    "TanStack Query": ["Caching", "Sync", "Optimistic"],
    "Zustand": ["Lightweight", "Immutable", "DevTools"],
    "Stripe": ["Payments", "Webhooks", "Subscriptions"],
    "Resend": ["Templates", "Analytics", "Deliverability"],
    "Sentry": ["Error Tracking", "Performance", "Releases"],
    "PostHog": ["Events", "Funnels", "Feature Flags"],
  };
  return tags[name] || ["Modern", "Reliable", "Scalable"];
}

function getUsagePercentage(popularity: "high" | "medium" | "low"): number {
  const percentages = {
    high: 95,
    medium: 75,
    low: 45
  };
  return percentages[popularity];
} 