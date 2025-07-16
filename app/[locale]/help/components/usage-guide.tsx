"use client";

import { useState } from "react";

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

const usageSections: UsageSection[] = [
  {
    id: "creating-items",
    title: "Creating Directory Items",
    description: "Learn how to add and manage items in your directory.",
    content: [
      {
        type: 'text',
        value: 'Navigate to the admin dashboard and click "Add New Item" to create a new directory entry. Fill in the required fields and configure the item settings.'
      },
      {
        type: 'code',
        value: `// Example: Creating an item programmatically
import { createItem } from '@/lib/api';

const newItem = await createItem({
  title: "Amazing SaaS Tool",
  description: "A powerful tool for productivity",
  category: "productivity",
  tags: ["saas", "productivity", "business"],
  url: "https://example.com",
  pricing: "freemium",
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
    title: "Customizing Your Design",
    description: "Personalize your directory with custom themes and branding.",
    content: [
      {
        type: 'text',
        value: 'Ever Works comes with a powerful theming system built on Tailwind CSS. You can customize colors, fonts, and layouts to match your brand.'
      },
      {
        type: 'code',
        value: `// tailwind.config.ts - Custom theme configuration
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        brand: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    }
  }
}`,
        language: 'typescript'
      }
    ]
  },
  {
    id: "managing-users",
    title: "User Management",
    description: "Handle user authentication, roles, and permissions.",
    content: [
      {
        type: 'text',
        value: 'Ever Works includes a complete authentication system with support for multiple providers. You can manage user roles and permissions through the admin dashboard.'
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
    title: "Setting up Payments",
    description: "Configure Stripe for paid submissions and premium features.",
    content: [
      {
        type: 'text',
        value: 'Ever Works integrates with Stripe for handling payments. Configure your Stripe keys in the environment variables and set up your pricing plans.'
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
      type: 'directory_submission',
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
    title: "Deployment",
    description: "Deploy your directory to production with Vercel or other platforms.",
    content: [
      {
        type: 'text',
        value: 'Ever Works is optimized for deployment on Vercel, but can be deployed to any platform that supports Next.js. Here\'s how to deploy to different platforms:'
      },
      {
        type: 'code',
        value: `# Vercel Deployment
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXTAUTH_SECRET

# Deploy to production
vercel --prod`,
        language: 'bash'
      },
      {
        type: 'code',
        value: `# Docker Deployment
# Build Docker image
docker build -t ever-works .

# Run container
docker run -p 3000:3000 \\
  -e NEXT_PUBLIC_APP_URL=https://yourdomain.com \\
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \\
  -e NEXTAUTH_SECRET=your_secret \\
  ever-works`,
        language: 'bash'
      }
    ]
  }
];

export function UsageGuide() {
  const [activeSection, setActiveSection] = useState("creating-items");

  return (
    <section className="py-12 bg-gray-900 rounded-2xl p-8 border border-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            🚀 Usage Guide
          </h2>
          <p className="text-gray-400 text-lg">
            Learn how to use and customize Ever Works for your directory
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {usageSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="grid grid-cols-1 gap-8">
          {usageSections.map((section) => (
            <div
              key={section.id}
              className={`transition-all duration-300 ${
                activeSection === section.id ? 'block' : 'hidden'
              }`}
            >
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {section.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {section.description}
                </p>
              </div>

              {/* Content Blocks */}
              <div className="space-y-6">
                {section.content.map((content, index) => (
                  <div key={index}>
                    {content.type === 'text' && (
                      <div className="bg-gray-800 rounded-lg p-6">
                        <p className="text-gray-300 leading-relaxed">
                          {content.value}
                        </p>
                      </div>
                    )}

                    {content.type === 'code' && (
                      <div className="bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
                        {/* Code Header */}
                        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="text-gray-400 text-sm font-mono">
                            {content.language || 'code'}
                          </div>
                          <div className="w-12"></div>
                        </div>

                        {/* Code Content */}
                        <div className="p-4 font-mono text-sm overflow-x-auto">
                          <pre className="text-gray-300 leading-relaxed">
                            <code>
                              {content.value.split('\n').map((line, lineIndex) => (
                                <div key={lineIndex} className="flex">
                                  <span className="text-gray-600 mr-4 select-none w-8 text-right">
                                    {lineIndex + 1}
                                  </span>
                                  <span className={
                                    line.trim().startsWith('//') || line.trim().startsWith('#') ? 'text-gray-500' :
                                    line.includes('import') || line.includes('export') ? 'text-blue-400' :
                                    line.includes('const') || line.includes('let') || line.includes('var') ? 'text-purple-400' :
                                    line.includes('function') || line.includes('async') || line.includes('await') ? 'text-green-400' :
                                    line.includes('return') ? 'text-yellow-400' :
                                    line.includes('npm') || line.includes('pnpm') || line.includes('yarn') ? 'text-green-400' :
                                    line.includes('docker') || line.includes('vercel') ? 'text-cyan-400' :
                                    'text-gray-300'
                                  }>
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
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-400">
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
        <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">💡 Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Regular Backups</h4>
                <p className="text-gray-400 text-sm">Always backup your database before major updates</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🔒</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Security</h4>
                <p className="text-gray-400 text-sm">Keep your environment variables secure and rotate keys regularly</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">⚡</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Performance</h4>
                <p className="text-gray-400 text-sm">Optimize images and use caching for better performance</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">📊</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Analytics</h4>
                <p className="text-gray-400 text-sm">Monitor your directory's performance with built-in analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 