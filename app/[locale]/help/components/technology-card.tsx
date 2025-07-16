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
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-50 to-blue-100 border-blue-200 text-blue-900 hover:from-blue-100 hover:to-blue-200 hover:shadow-blue-500/10";
      case "green":
        return "from-green-50 to-green-100 border-green-200 text-green-900 hover:from-green-100 hover:to-green-200 hover:shadow-green-500/10";
      case "purple":
        return "from-purple-50 to-purple-100 border-purple-200 text-purple-900 hover:from-purple-100 hover:to-purple-200 hover:shadow-purple-500/10";
      case "orange":
        return "from-orange-50 to-orange-100 border-orange-200 text-orange-900 hover:from-orange-100 hover:to-orange-200 hover:shadow-orange-500/10";
      case "pink":
        return "from-pink-50 to-pink-100 border-pink-200 text-pink-900 hover:from-pink-100 hover:to-pink-200 hover:shadow-pink-500/10";
      case "yellow":
        return "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900 hover:from-yellow-100 hover:to-yellow-200 hover:shadow-yellow-500/10";
      case "red":
        return "from-red-50 to-red-100 border-red-200 text-red-900 hover:from-red-100 hover:to-red-200 hover:shadow-red-500/10";
      case "gray":
        return "from-gray-50 to-gray-100 border-gray-200 text-gray-900 hover:from-gray-100 hover:to-gray-200 hover:shadow-gray-500/10";
      default:
        return "from-blue-50 to-blue-100 border-blue-200 text-blue-900 hover:from-blue-100 hover:to-blue-200 hover:shadow-blue-500/10";
    }
  };

  const popularityStyles = {
    high: "ring-2 ring-yellow-400 ring-opacity-50",
    medium: "",
    low: "opacity-90"
  };

  const popularityBadge = {
    high: { text: "Popular", color: "bg-yellow-100 text-yellow-800" },
    medium: { text: "Stable", color: "bg-green-100 text-green-800" },
    low: { text: "Niche", color: "bg-gray-100 text-gray-800" }
  };

  return (
    <div className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${getColorClasses(color)} ${popularityStyles[popularity]}`}>
      {/* Popularity Badge */}
      <div className="absolute -top-2 -right-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${popularityBadge[popularity].color}`}>
          {popularityBadge[popularity].text}
        </span>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

      <div className="relative flex items-start gap-4">
        {/* Icon with animated background */}
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 rounded-lg bg-white/80 flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
            {icon}
          </div>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg leading-tight group-hover:text-opacity-80 transition-colors">
                {name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-70">
                  {category}
                </span>
                {version && (
                  <span className="text-xs px-2 py-1 bg-white/80 rounded-full font-mono border border-white/50">
                    v{version}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm opacity-80 leading-relaxed line-clamp-3">
            {description}
          </p>

          {/* Features/Tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {getFeatureTags(name).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 text-xs bg-white/60 rounded-md border border-white/30 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar (fake usage indicator) */}
      <div className="mt-4 relative">
        <div className="h-1 bg-white/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-white to-white/80 transition-all duration-500 group-hover:from-white/90 group-hover:to-white"
            style={{ width: `${getUsagePercentage(popularity)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs opacity-60">
          <span>Usage in project</span>
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