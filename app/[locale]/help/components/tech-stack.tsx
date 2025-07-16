"use client";

import { useTranslations } from 'next-intl';


interface TechItem {
  name: string;
  icon: string;
  description: string;
  category: string;
  color: string;
}

const techStack: TechItem[] = [
  {
    name: "Next.js",
    icon: "⚡",
    description: "Full stack React framework for production.",
    category: "Frontend Framework",
    color: "from-gray-800 to-gray-900"
  },
  {
    name: "TypeScript",
    icon: "🔷",
    description: "Typed superset of JavaScript for better development.",
    category: "Language",
    color: "from-blue-800 to-blue-900"
  },
  {
    name: "Tailwind CSS",
    icon: "🎨",
    description: "CSS framework for rapid UI development.",
    category: "Styling",
    color: "from-cyan-800 to-cyan-900"
  },
  {
    name: "HeroUI",
    icon: "🎯",
    description: "Modern React component library for building UIs.",
    category: "UI Components",
    color: "from-purple-800 to-purple-900"
  },
  {
    name: "NextAuth.js",
    icon: "🔐",
    description: "Complete authentication solution for Next.js.",
    category: "Authentication",
    color: "from-green-800 to-green-900"
  },
  {
    name: "Supabase",
    icon: "🗃️",
    description: "Open source Firebase alternative with PostgreSQL.",
    category: "Backend",
    color: "from-emerald-800 to-emerald-900"
  },
  {
    name: "Drizzle ORM",
    icon: "🔧",
    description: "TypeScript ORM for SQL databases.",
    category: "Database",
    color: "from-orange-800 to-orange-900"
  },
  {
    name: "TanStack Query",
    icon: "🔄",
    description: "Powerful data synchronization for React.",
    category: "Data Fetching",
    color: "from-red-800 to-red-900"
  },
  {
    name: "Stripe",
    icon: "💳",
    description: "Best and most secure online payment service.",
    category: "Payments",
    color: "from-indigo-800 to-indigo-900"
  },
  {
    name: "Resend",
    icon: "✉️",
    description: "Modern email service for developers.",
    category: "Email",
    color: "from-teal-800 to-teal-900"
  },
  {
    name: "Sentry",
    icon: "🛡️",
    description: "Application monitoring and error tracking.",
    category: "Monitoring",
    color: "from-rose-800 to-rose-900"
  },
  {
    name: "Framer Motion",
    icon: "🎪",
    description: "Production-ready motion library for React.",
    category: "Animation",
    color: "from-pink-800 to-pink-900"
  },
  {
    name: "Zustand",
    icon: "🐻",
    description: "Small, fast and scalable state management.",
    category: "State Management",
    color: "from-amber-800 to-amber-900"
  },
  {
    name: "Zod",
    icon: "✅",
    description: "TypeScript-first schema validation library.",
    category: "Validation",
    color: "from-lime-800 to-lime-900"
  },
  {
    name: "PostHog",
    icon: "📊",
    description: "Open source product analytics platform.",
    category: "Analytics",
    color: "from-violet-800 to-violet-900"
  },
  {
    name: "Vercel",
    icon: "🚀",
    description: "The platform for frontend developers.",
    category: "Deployment",
    color: "from-gray-800 to-black"
  }
];

export function TechStack() {
  const t = useTranslations('help');

  return (

        <div className="py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-blue-400 text-sm font-medium tracking-wider uppercase mb-4">
              POWERED BY
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('TECH_STACK_TITLE')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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
                <div className={`bg-gradient-to-br ${tech.color} p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300 h-full`}>
                  {/* Icon & Name */}
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">{tech.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{tech.name}</h3>
                      <p className="text-xs text-gray-400 font-medium">{tech.category}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {tech.description}
                  </p>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="mt-20 text-center">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">{t('TECH_STACK_READY')}</h3>
              <p className="text-gray-400 mb-6">
                {t('TECH_STACK_READY_DESC')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm">TypeScript Ready</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm">Production Tested</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm">Fully Documented</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm">Enterprise Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

  );
} 