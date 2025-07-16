"use client";

import { useState } from "react";

interface InstallationStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  screenshot?: string;
  terminal?: boolean;
}

const installationSteps: InstallationStep[] = [
  {
    id: "clone",
    title: "1. Clone the Repository",
    description: "Start by cloning the Ever Works repository to your local machine.",
    code: `git clone https://github.com/ever-co/ever-works-website-template.git
cd ever-works-website-template`,
    terminal: true
  },
  {
    id: "install",
    title: "2. Install Dependencies",
    description: "Install all required dependencies using your preferred package manager.",
    code: `# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install`,
    terminal: true
  },
  {
    id: "env",
    title: "3. Setup Environment Variables",
    description: "Copy the environment example file and configure your variables.",
    code: `# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
# Required variables:
# - NEXT_PUBLIC_APP_URL
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXTAUTH_SECRET`,
    terminal: true
  },
  {
    id: "database",
    title: "4. Setup Database",
    description: "Configure your Supabase database and run migrations.",
    code: `# Generate database schema
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Open database studio (optional)
pnpm db:studio`,
    terminal: true
  },
  {
    id: "dev",
    title: "5. Start Development Server",
    description: "Launch the development server and start building your directory.",
    code: `# Start the development server
pnpm dev

# Server will be available at:
# http://localhost:3000`,
    terminal: true
  }
];

export function InstallationGuide() {
  const [activeStep, setActiveStep] = useState("clone");

  return (
    <section className="py-12 bg-gray-900 rounded-2xl p-8 border border-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            📚 Installation Guide
          </h2>
          <p className="text-gray-400 text-lg">
            Follow these steps to get Ever Works running on your local machine
          </p>
        </div>

        {/* Steps Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {installationSteps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeStep === step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {step.title.split('.')[0]}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Step Instructions */}
          <div className="space-y-6">
            {installationSteps.map((step) => (
              <div
                key={step.id}
                className={`transition-all duration-300 ${
                  activeStep === step.id ? 'block' : 'hidden'
                }`}
              >
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Progress */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((installationSteps.findIndex(s => s.id === step.id) + 1) / installationSteps.length) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-gray-400 text-sm">
                      {installationSteps.findIndex(s => s.id === step.id) + 1} of {installationSteps.length}
                    </span>
                  </div>

                  {/* Next Step Button */}
                  {installationSteps.findIndex(s => s.id === step.id) < installationSteps.length - 1 && (
                    <button
                      onClick={() => {
                        const currentIndex = installationSteps.findIndex(s => s.id === step.id);
                        setActiveStep(installationSteps[currentIndex + 1].id);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Next Step →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Code Example */}
          <div className="sticky top-8">
            {installationSteps.map((step) => (
              <div
                key={step.id}
                className={`transition-all duration-300 ${
                  activeStep === step.id ? 'block' : 'hidden'
                }`}
              >
                {step.code && (
                  <div className="bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
                    {/* Terminal Header */}
                    <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="text-gray-400 text-sm font-mono">
                        {step.terminal ? 'Terminal' : 'Code'}
                      </div>
                      <div className="w-12"></div>
                    </div>

                    {/* Code Content */}
                    <div className="p-4 font-mono text-sm">
                      <pre className="text-gray-300 leading-relaxed">
                        <code>
                          {step.code.split('\n').map((line, index) => (
                            <div key={index} className="flex">
                              <span className="text-gray-600 mr-4 select-none w-8 text-right">
                                {index + 1}
                              </span>
                              <span className={
                                line.startsWith('#') ? 'text-gray-500' :
                                line.startsWith('pnpm') || line.startsWith('npm') || line.startsWith('yarn') ? 'text-green-400' :
                                line.startsWith('git') ? 'text-blue-400' :
                                line.startsWith('cp') ? 'text-yellow-400' :
                                line.includes('http://') ? 'text-cyan-400' :
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

                {/* Screenshot Placeholder */}
                {step.screenshot && (
                  <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                        </svg>
                        <p className="text-sm">Screenshot: {step.title}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start Tips */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">💡 Quick Start Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Use pnpm</h4>
                <p className="text-gray-400 text-sm">Faster and more efficient than npm</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">⚡</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Environment Check</h4>
                <p className="text-gray-400 text-sm">Run <code className="bg-gray-800 px-1 rounded">pnpm check-env</code> to verify setup</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🔧</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Development Mode</h4>
                <p className="text-gray-400 text-sm">Hot reload and detailed error messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 