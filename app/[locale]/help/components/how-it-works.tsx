"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";

interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  code: string;
  codeLanguage: string;
  features: string[];
}

export function HowItWorks() {
  const t = useTranslations('help');
  const [activeStep, setActiveStep] = useState(0);
  
  const steps: Step[] = [
    {
      id: "setup",
      number: "01",
      title: t('HOW_IT_WORKS_STEP1_TITLE'),
      description: t('HOW_IT_WORKS_STEP1_DESC'),
      icon: "⚙️",
      color: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500 to-cyan-500",
      codeLanguage: "bash",
      code: `# Clone the repository
git clone https://github.com/your-username/ever-works.git

# Navigate to project directory
cd ever-works

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env`,
      features: [
        "Repository cloning",
        "Dependency installation", 
        "Environment setup",
        "Project initialization"
      ]
    },
    {
      id: "configure",
      number: "02", 
      title: t('HOW_IT_WORKS_STEP2_TITLE'),
      description: t('HOW_IT_WORKS_STEP2_DESC'),
      icon: "🎯",
      color: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500 to-pink-500",
      codeLanguage: "env",
      code: `# Core Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database Setup
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# External Services
RESEND_API_KEY=your_resend_key
STRIPE_PUBLIC_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret`,
      features: [
        "Environment variables",
        "Database configuration",
        "Authentication setup",
        "External services"
      ]
    },
    {
      id: "deploy",
      number: "03",
      title: t('HOW_IT_WORKS_STEP3_TITLE'), 
      description: t('HOW_IT_WORKS_STEP3_DESC'),
      icon: "🚀",
      color: "text-green-600 dark:text-green-400",
      gradient: "from-green-500 to-emerald-500",
      codeLanguage: "bash",
      code: `# Start development server
pnpm dev

# Or deploy to production
pnpm build
pnpm start

# Deploy to Vercel (recommended)
vercel --prod`,
      features: [
        "Development server",
        "Production build",
        "Vercel deployment",
        "Live platform"
      ]
    }
  ];

  const benefits = [
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Get your platform running in under 10 minutes"
    },
    {
      icon: "🔒", 
      title: "Secure by Default",
      description: "Built-in security best practices and authentication"
    },
    {
      icon: "📱",
      title: "Mobile Ready",
      description: "Fully responsive design that works on all devices"
    },
    {
      icon: "🎨",
      title: "Customizable",
      description: "Easy to customize with Tailwind CSS and themes"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <span>🎯</span>
            {t('HOW_IT_WORKS_TITLE')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
            {t('HOW_IT_WORKS_SUBTITLE')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
            {t('HOW_IT_WORKS_DESCRIPTION')}
          </p>
        </div>

        {/* Interactive Steps */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`relative group cursor-pointer transition-all duration-300 ${
                activeStep === index 
                  ? 'transform scale-105' 
                  : 'hover:transform hover:scale-102'
              }`}
              onClick={() => setActiveStep(index)}
            >
              {/* Step Card */}
              <div className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border-2 transition-all duration-300 ${
                activeStep === index
                  ? 'border-blue-500 shadow-xl shadow-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}>
                {/* Step Number */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center text-white font-bold text-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>

                {/* Step Icon */}
                <div className="text-4xl mb-4">{step.icon}</div>

                {/* Step Content */}
                <h3 className={`text-xl font-bold mb-3 ${step.color}`}>
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Features List */}
                <div className="space-y-2">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.gradient}`}></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Active Indicator */}
                {activeStep === index && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Code Preview */}
        <div className="mb-16">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
            {/* Code Header */}
            <div className="bg-slate-100 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    {steps[activeStep].codeLanguage}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                    Step {activeStep + 1} of {steps.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Code Content */}
            <div className="p-6">
              <pre className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto">
                <code>
                  {steps[activeStep].code.split('\n').map((line, index) => (
                    <div key={index} className="flex">
                      <span className="text-slate-500 dark:text-slate-600 mr-4 select-none w-8 text-right">
                        {index + 1}
                      </span>
                      <span className={
                        line.startsWith('#') ? 'text-slate-500 dark:text-slate-500' :
                        line.includes('=') ? 'text-blue-600 dark:text-blue-400' :
                        line.includes('pnpm') || line.includes('git') ? 'text-green-600 dark:text-green-400' :
                        'text-slate-800 dark:text-slate-200'
                      }>
                        {line}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Why Choose Our Platform?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {benefit.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
              Ready to Get Started?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Join thousands of developers who are already building amazing web platforms with our foundation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Start Building Now
              </Button>
              <Button variant="outline" className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold px-8 py-3 rounded-xl transition-all duration-300">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 