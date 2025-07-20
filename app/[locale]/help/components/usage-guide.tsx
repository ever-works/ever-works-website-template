"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface UsageSection {
  id: string;
  title: string;
  description: string;
  content: {
    type: 'code' | 'screenshot' | 'text';
    value: string;
    language?: string;
  }[];
}

export function UsageGuide() {
  const [activeSection, setActiveSection] = useState("creating-items");
  const t = useTranslations("help");

  const usageSections: UsageSection[] = [
    {
      id: "creating-items",
      title: t("USAGE_CREATING_ITEMS_TITLE"),
      description: t("USAGE_CREATING_ITEMS_DESC"),
      content: [
        {
          type: 'text',
          value: t("USAGE_CREATING_ITEMS_TEXT")
        },
        {
          type: 'code',
          value: `// Example: Creating an item programmatically
import { createItem } from '@/lib/api';

const newItem = await createItem({
  title: "Modern Web Application",
  description: "A powerful application for modern businesses",
  category: "business",
  tags: ["web", "business", "productivity"],
  url: "https://example.com",
  pricing: "premium",
  features: [
    "Real-time collaboration",
    "Advanced analytics",
    "API integration"
  ]
});`,
          language: 'typescript'
        }
      ]
    },
    {
      id: "customizing-design",
      title: t("USAGE_CUSTOMIZING_DESIGN_TITLE"),
      description: t("USAGE_CUSTOMIZING_DESIGN_DESC"),
      content: [
        {
          type: 'text',
          value: t("USAGE_CUSTOMIZING_DESIGN_TEXT")
        },
        {
          type: 'code',
          value: `// Example: Customizing theme colors
export const customTheme = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#8b5cf6",
  background: "#ffffff",
  surface: "#f8f9fa",
  text: "#1a1a1a",
  textSecondary: "#6c757d",
};

// Apply theme in your component
function MyComponent() {
  return (
    <div className="bg-theme-primary text-white">
      Custom themed content
    </div>
  );
}`,
          language: 'typescript'
        }
      ]
    },
    {
      id: "managing-users",
      title: t("USAGE_MANAGING_USERS_TITLE"),
      description: t("USAGE_MANAGING_USERS_DESC"),
      content: [
        {
          type: 'text',
          value: t("USAGE_MANAGING_USERS_TEXT")
        },
        {
          type: 'code',
          value: `// Example: User role middleware
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  // Check user permissions
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}`,
          language: 'typescript'
        }
      ]
    },
    {
      id: "payments-setup",
      title: t("USAGE_PAYMENTS_SETUP_TITLE"),
      description: t("USAGE_PAYMENTS_SETUP_DESC"),
      content: [
        {
          type: 'text',
          value: t("USAGE_PAYMENTS_SETUP_TEXT")
        },
        {
          type: 'code',
          value: `// Example: Creating a payment intent
import { stripe } from '@/lib/stripe';

export async function createPaymentIntent(amount: number, currency = 'usd') {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency,
    metadata: {
      type: 'platform_submission',
      plan: 'premium'
    }
  });
  
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
}

// Usage in API route
export async function POST(request: Request) {
  const { amount } = await request.json();
  
  try {
    const { clientSecret } = await createPaymentIntent(amount);
    return Response.json({ clientSecret });
  } catch (error) {
    return Response.json({ error: 'Payment failed' }, { status: 500 });
  }
}`,
          language: 'typescript'
        }
      ]
    },
    {
      id: "deployment",
      title: t("USAGE_DEPLOYMENT_TITLE"),
      description: t("USAGE_DEPLOYMENT_DESC"),
      content: [
        {
          type: 'text',
          value: t("USAGE_DEPLOYMENT_TEXT")
        },
        {
          type: 'code',
          value: `# Vercel Deployment
npx vercel

# Or with custom domain
npx vercel --prod --alias yourdomain.com

# Docker Deployment
docker build -t my-platform .
docker run -p 3000:3000 my-platform

# Manual deployment
npm run build
npm start`,
          language: 'bash'
        }
      ]
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-dark--theme-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            {t("USAGE_GUIDE_TITLE")}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
            {t("USAGE_GUIDE_SUBTITLE")}
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {usageSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSection === section.id
                  ? "bg-theme-primary-600 dark:bg-theme-primary-500 text-white shadow-lg shadow-theme-primary-500/25"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="space-y-6">
          {usageSections.map((section) => (
            <div
              key={section.id}
              className={`transition-all duration-300 ${
                activeSection === section.id ? 'block' : 'hidden'
              }`}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  {section.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                  {section.description}
                </p>
              </div>

              {/* Content Blocks */}
              <div className="space-y-6">
                {section.content.map((content, index) => (
                  <div key={index}>
                    {content.type === 'text' && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                          {content.value}
                        </p>
                      </div>
                    )}

                    {content.type === 'code' && (
                      <div className="bg-gray-900 dark:bg-gray-950 rounded-lg border border-gray-700 dark:border-gray-800 overflow-hidden shadow-xl transition-all duration-300">
                        {/* Code Header */}
                        <div className="bg-gray-800 dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700 dark:border-gray-800 transition-all duration-300">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="text-gray-400 dark:text-gray-500 text-sm font-mono transition-colors duration-300">
                            {content.language || 'code'}
                          </div>
                          <div className="w-12"></div>
                        </div>

                        {/* Code Content */}
                        <div className="p-4 font-mono text-sm overflow-x-auto">
                          <pre className="text-gray-300 dark:text-gray-400 leading-relaxed transition-colors duration-300">
                            <code>
                              {content.value.split('\n').map((line, lineIndex) => (
                                <div key={lineIndex} className="flex">
                                  <span className="text-gray-600 dark:text-gray-500 mr-4 select-none w-8 text-right transition-colors duration-300">
                                    {lineIndex + 1}
                                  </span>
                                  <span className={`transition-colors duration-300 ${
                                    line.trim().startsWith('//') || line.trim().startsWith('#') ? 'text-gray-500 dark:text-gray-600' :
                                    line.includes('import') || line.includes('export') ? 'text-blue-400 dark:text-blue-500' :
                                    line.includes('const') || line.includes('let') || line.includes('var') ? 'text-purple-400 dark:text-purple-500' :
                                    line.includes('function') || line.includes('async') || line.includes('await') ? 'text-green-400 dark:text-green-500' :
                                    line.includes('return') ? 'text-yellow-400 dark:text-yellow-500' :
                                    line.includes('npm') || line.includes('pnpm') || line.includes('yarn') ? 'text-green-400 dark:text-green-500' :
                                    line.includes('docker') || line.includes('vercel') ? 'text-cyan-400 dark:text-cyan-500' :
                                    'text-gray-300 dark:text-gray-400'
                                  }`}>
                                    {line}
                                  </span>
                                </div>
                              ))}
                            </code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {content.type === 'screenshot' && (
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300">
                        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-300">
                          <div className="text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                            </svg>
                            <p className="text-sm">Screenshot: {content.value}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Best Practices */}
        <div className="mt-12 bg-gradient-to-r from-theme-primary-50 to-theme-secondary-50 dark:from-theme-primary-900/20 dark:to-theme-secondary-900/20 rounded-2xl p-6 border border-theme-primary-200 dark:border-theme-primary-800 transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            {t("USAGE_BEST_PRACTICES_TITLE")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{t("USAGE_BEST_PRACTICE_1_TITLE")}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{t("USAGE_BEST_PRACTICE_1_DESC")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300">
                <span className="text-white text-sm">🔒</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{t("USAGE_BEST_PRACTICE_2_TITLE")}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{t("USAGE_BEST_PRACTICE_2_DESC")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300">
                <span className="text-white text-sm">⚡</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{t("USAGE_BEST_PRACTICE_3_TITLE")}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{t("USAGE_BEST_PRACTICE_3_DESC")}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300">
                <span className="text-white text-sm">📊</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{t("USAGE_BEST_PRACTICE_4_TITLE")}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{t("USAGE_BEST_PRACTICE_4_DESC")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 