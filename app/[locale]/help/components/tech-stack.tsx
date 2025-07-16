"use client";

import { useTranslations } from 'next-intl';


interface TechItem {
  name: string;
  icon: string;
  descriptionKey: string;
  categoryKey: string;
  color: string;
}

const techStack: TechItem[] = [
  {
    name: "Next.js",
    icon: "⚡",
    descriptionKey: "TECH_NEXTJS_DESC",
    categoryKey: "TECH_NEXTJS_CATEGORY",
    color: "from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
  },
  {
    name: "TypeScript",
    icon: "🔷",
    descriptionKey: "TECH_TYPESCRIPT_DESC",
    categoryKey: "TECH_TYPESCRIPT_CATEGORY",
    color: "from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-800"
  },
  {
    name: "Tailwind CSS",
    icon: "🎨",
    descriptionKey: "TECH_TAILWIND_DESC",
    categoryKey: "TECH_TAILWIND_CATEGORY",
    color: "from-cyan-200 to-cyan-300 dark:from-cyan-700 dark:to-cyan-800"
  },
  {
    name: "HeroUI",
    icon: "🎯",
    descriptionKey: "TECH_HEROUI_DESC",
    categoryKey: "TECH_HEROUI_CATEGORY",
    color: "from-purple-200 to-purple-300 dark:from-purple-700 dark:to-purple-800"
  },
  {
    name: "NextAuth.js",
    icon: "🔐",
    descriptionKey: "TECH_NEXTAUTH_DESC",
    categoryKey: "TECH_NEXTAUTH_CATEGORY",
    color: "from-green-200 to-green-300 dark:from-green-700 dark:to-green-800"
  },
  {
    name: "Supabase",
    icon: "🗃️",
    descriptionKey: "TECH_SUPABASE_DESC",
    categoryKey: "TECH_SUPABASE_CATEGORY",
    color: "from-emerald-200 to-emerald-300 dark:from-emerald-700 dark:to-emerald-800"
  },
  {
    name: "Drizzle ORM",
    icon: "🔧",
    descriptionKey: "TECH_DRIZZLE_DESC",
    categoryKey: "TECH_DRIZZLE_CATEGORY",
    color: "from-orange-200 to-orange-300 dark:from-orange-700 dark:to-orange-800"
  },
  {
    name: "TanStack Query",
    icon: "🔄",
    descriptionKey: "TECH_TANSTACK_DESC",
    categoryKey: "TECH_TANSTACK_CATEGORY",
    color: "from-red-200 to-red-300 dark:from-red-700 dark:to-red-800"
  },
  {
    name: "Stripe",
    icon: "💳",
    descriptionKey: "TECH_STRIPE_DESC",
    categoryKey: "TECH_STRIPE_CATEGORY",
    color: "from-indigo-200 to-indigo-300 dark:from-indigo-700 dark:to-indigo-800"
  },
  {
    name: "Resend",
    icon: "✉️",
    descriptionKey: "TECH_RESEND_DESC",
    categoryKey: "TECH_RESEND_CATEGORY",
    color: "from-teal-200 to-teal-300 dark:from-teal-700 dark:to-teal-800"
  },
  {
    name: "Sentry",
    icon: "🛡️",
    descriptionKey: "TECH_SENTRY_DESC",
    categoryKey: "TECH_SENTRY_CATEGORY",
    color: "from-rose-200 to-rose-300 dark:from-rose-700 dark:to-rose-800"
  },
  {
    name: "Framer Motion",
    icon: "🎪",
    descriptionKey: "TECH_FRAMER_DESC",
    categoryKey: "TECH_FRAMER_CATEGORY",
    color: "from-pink-200 to-pink-300 dark:from-pink-700 dark:to-pink-800"
  },
  {
    name: "Zustand",
    icon: "🐻",
    descriptionKey: "TECH_ZUSTAND_DESC",
    categoryKey: "TECH_ZUSTAND_CATEGORY",
    color: "from-amber-200 to-amber-300 dark:from-amber-700 dark:to-amber-800"
  },
  {
    name: "Zod",
    icon: "✅",
    descriptionKey: "TECH_ZOD_DESC",
    categoryKey: "TECH_ZOD_CATEGORY",
    color: "from-lime-200 to-lime-300 dark:from-lime-700 dark:to-lime-800"
  },
  {
    name: "PostHog",
    icon: "📊",
    descriptionKey: "TECH_POSTHOG_DESC",
    categoryKey: "TECH_POSTHOG_CATEGORY",
    color: "from-violet-200 to-violet-300 dark:from-violet-700 dark:to-violet-800"
  },
  {
    name: "Vercel",
    icon: "🚀",
    descriptionKey: "TECH_VERCEL_DESC",
    categoryKey: "TECH_VERCEL_CATEGORY",
    color: "from-gray-200 to-gray-400 dark:from-gray-600 dark:to-black"
  }
];

export function TechStack() {
  const t = useTranslations('help');

  return (
    <section className="py-20 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
      <div className="py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-theme-primary-600 dark:text-theme-primary-400 text-sm font-medium tracking-wider uppercase mb-4">
            POWERED BY
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('TECH_STACK_TITLE')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            {t('TECH_STACK_SUBTITLE')}
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {techStack.map((tech, index) => (
            <div
              key={tech.name}
              className={`relative group hover:scale-105 transition-all duration-300 ${
                index % 2 === 0 ? 'animate-fade-in' : 'animate-fade-in-left'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`bg-gradient-to-br ${tech.color} p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 h-full shadow-lg hover:shadow-xl`}>
                {/* Icon & Name */}
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{tech.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tech.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t(tech.categoryKey as any)}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {t(tech.descriptionKey as any)}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-theme-primary-500/10 to-theme-secondary-500/10 dark:from-theme-primary-400/10 dark:to-theme-secondary-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-20 text-center">
          <div className="bg-gray-50 dark:bg-gray-800/70 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('TECH_STACK_READY')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('TECH_STACK_READY_DESC')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-theme-secondary-600 dark:text-theme-secondary-400">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">TypeScript Ready</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-theme-secondary-600 dark:text-theme-secondary-400">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Production Tested</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-theme-secondary-600 dark:text-theme-secondary-400">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Fully Documented</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-theme-secondary-600 dark:text-theme-secondary-400">✓</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Enterprise Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 