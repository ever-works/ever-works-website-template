"use client";

import { Step, StepList } from "./step-component";
import { CodeExample, MultiCodeExample } from "./code-example";
import { ScreenshotPlaceholder, ImageGallery } from "./screenshot-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    Settings,
    Play,
    BookOpen,
    Wrench,
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    Github,
    Globe
} from "lucide-react";

export function HelpContent() {
  return (
    <div className="space-y-16">
      {/* Getting Started Section */}
      <section id="getting-started" className="scroll-mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            🚀 Getting Started
          </h2>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Welcome to Ever Works! This comprehensive guide will help you get up and running with our platform in just a few minutes. 
            Whether you're a developer looking to integrate our services or a business owner wanting to leverage our tools, this guide has you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                Quick Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 dark:text-green-300">
                Get started in under 5 minutes with our automated setup process.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Comprehensive guides and API documentation for developers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Wrench className="w-5 h-5" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                24/7 technical support and community resources.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Installation Section */}
      <section id="installation" className="scroll-mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            📦 Installation
          </h2>
        </div>

        <StepList>
          <Step
            number={1}
            title="Prerequisites"
            description="Ensure your system meets the minimum requirements before installation."
            status="info"
          >
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">System Requirements:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Node.js 18.x or higher</li>
                  <li>• npm, yarn, or pnpm package manager</li>
                  <li>• Git for version control</li>
                  <li>• PostgreSQL 14+ (optional, for database features)</li>
                </ul>
              </div>
              
              <CodeExample
                title="Check your Node.js version"
                code="node --version
npm --version"
                language="bash"
              />
            </div>
          </Step>

          <Step
            number={2}
            title="Clone the Repository"
            description="Download the Ever Works template to your local machine."
            status="current"
          >
            <MultiCodeExample
              examples={[
                {
                  title: "HTTPS",
                  code: "git clone https://github.com/ever-works/ever-works-website-template.git\ncd ever-works-website-template",
                  language: "bash"
                },
                {
                  title: "SSH",
                  code: "git clone git@github.com:ever-works/ever-works-website-template.git\ncd ever-works-website-template",
                  language: "bash"
                },
                {
                  title: "GitHub CLI",
                  code: "gh repo clone ever-works/ever-works-website-template\ncd ever-works-website-template",
                  language: "bash"
                }
              ]}
            />
            
            <ScreenshotPlaceholder
              title="Repository Structure"
              description="Overview of the project structure after cloning"
              type="screenshot"
            />
          </Step>

          <Step
            number={3}
            title="Install Dependencies"
            description="Install all required packages and dependencies."
          >
            <MultiCodeExample
              examples={[
                {
                  title: "npm",
                  code: "npm install",
                  language: "bash"
                },
                {
                  title: "yarn",
                  code: "yarn install",
                  language: "bash"
                },
                {
                  title: "pnpm",
                  code: "pnpm install",
                  language: "bash"
                }
              ]}
            />
            
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Note:</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    The installation may take a few minutes depending on your internet connection. 
                    If you encounter any issues, try clearing your package manager cache.
                  </p>
                </div>
              </div>
            </div>
          </Step>

          <Step
            number={4}
            title="Environment Setup"
            description="Configure your environment variables and local settings."
            status="pending"
          >
            <CodeExample
              title="Create environment file"
              code="cp .env.example .env.local"
              language="bash"
            />
            
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Required Environment Variables:</h4>
              <CodeExample
                filename=".env.local"
                code={`# Authentication & Security
AUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Database (Optional)
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"

# Content Repository
GH_TOKEN="your-github-token"
DATA_REPOSITORY="https://github.com/your-username/your-content-repo"`}
                language="env"
                showLineNumbers={true}
              />
            </div>
          </Step>

          <Step
            number={5}
            title="Start Development Server"
            description="Launch the application in development mode."
            status="pending"
          >
            <CodeExample
              code="npm run dev"
              language="bash"
            />
            
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200">Success!</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your application should now be running at{" "}
                    <a href="http://localhost:3000" className="underline font-mono" target="_blank" rel="noopener noreferrer">
                      http://localhost:3000
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </Step>
        </StepList>
      </section>

      {/* Configuration Section */}
      <section id="configuration" className="scroll-mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            ⚙️ Configuration
          </h2>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Configure your Ever Works instance to match your specific needs and integrate with your existing systems.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                Authentication Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Configure OAuth providers and authentication methods.
              </p>
              <CodeExample
                code={`# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"`}
                language="env"
              />
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Authentication Guide
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Content Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Set up your content repository and data sources.
              </p>
              <CodeExample
                code={`# Content Repository
GH_TOKEN="your-github-token"
DATA_REPOSITORY="https://github.com/user/repo"

# Content Settings
CONTENT_WARNINGS_SILENT=false`}
                language="env"
              />
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Content Guide
              </Button>
            </CardContent>
          </Card>
        </div>

        <ScreenshotPlaceholder
          title="Configuration Dashboard"
          description="Visual interface for managing your Ever Works configuration"
          type="screenshot"
        />
      </section>

      {/* Usage Guide Section */}
      <section id="usage" className="scroll-mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            📖 Usage Guide
          </h2>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Operations
            </h3>
            
            <ImageGallery
              images={[
                {
                  title: "Dashboard Overview",
                  description: "Main dashboard with key metrics and navigation",
                  type: "screenshot"
                },
                {
                  title: "Content Management",
                  description: "Adding and managing your content items",
                  type: "screenshot"
                }
              ]}
              columns={2}
            />
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Advanced Features
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Theming</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Customize the appearance and branding of your platform.
                  </p>
                  <CodeExample
                    code={`// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#your-color',
        }
      }
    }
  }
}`}
                    language="javascript"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Integrate with external APIs and services.
                  </p>
                  <CodeExample
                    code={`// API client usage
import { apiClient } from '@/lib/api/api-client';

const data = await apiClient.get('/items');
const newItem = await apiClient.post('/items', item);`}
                    language="typescript"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting Section */}
      <section id="troubleshooting" className="scroll-mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            🔧 Troubleshooting
          </h2>
        </div>

        <div className="space-y-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">Common Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    🚫 Authentication Errors
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    If you're experiencing authentication issues, try these solutions:
                  </p>
                  <CodeExample
                    code={`# Clear browser cookies and restart server
rm -rf .next/cache
npm run dev

# Generate new authentication secret
openssl rand -base64 32`}
                    language="bash"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    💾 Database Connection Issues
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    For database connection problems:
                  </p>
                  <CodeExample
                    code={`# Check database status
pg_ctl status

# Reset database migrations
npm run db:generate
npm run db:migrate`}
                    language="bash"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400">Getting Help</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Community Support</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• GitHub Issues for bug reports</li>
                    <li>• Discord community for real-time help</li>
                    <li>• Documentation and guides</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Enterprise Support</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Priority technical support</li>
                    <li>• Custom implementation assistance</li>
                    <li>• Training and onboarding</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section id="advanced" className="scroll-mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            🚀 Advanced Features
          </h2>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explore advanced features and customization options to get the most out of your Ever Works platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Optimize your application for production environments.
              </p>
              <CodeExample
                code={`# Production build
npm run build
npm start

# Enable caching
ENABLE_STATIC_OPTIMIZATION=true`}
                language="bash"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Implement security best practices and monitoring.
              </p>
              <CodeExample
                code={`# Security headers
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# Enable monitoring
SENTRY_DEBUG=false
SENTRY_ENABLE_DEV=false`}
                language="env"
              />
            </CardContent>
          </Card>
        </div>

        <ScreenshotPlaceholder
          title="Performance Dashboard"
          description="Monitoring and analytics for your Ever Works platform"
          type="diagram"
          className="mt-8"
        />
      </section>
    </div>
  );
} 