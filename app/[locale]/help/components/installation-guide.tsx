"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface InstallationStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  screenshot?: string;
  terminal?: boolean;
}

export function InstallationGuide() {
  const [activeStep, setActiveStep] = useState("clone");
  const t = useTranslations("help");

  const installationSteps: InstallationStep[] = [
    {
      id: "clone",
      title: t("INSTALLATION_STEP1_TITLE"),
      description: t("INSTALLATION_STEP1_DESC"),
      code: `git clone https://github.com/ever-co/ever-works-website-template.git
cd ever-works-website-template`,
      terminal: true,
    },
    {
      id: "install",
      title: t("INSTALLATION_STEP2_TITLE"),
      description: t("INSTALLATION_STEP2_DESC"),
      code: `# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install`,
      terminal: true,
    },
    {
      id: "env",
      title: t("INSTALLATION_STEP3_TITLE"),
      description: t("INSTALLATION_STEP3_DESC"),
      code: `# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
# Required variables:
# - NEXT_PUBLIC_APP_URL
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXTAUTH_SECRET`,
      terminal: true,
    },
    {
      id: "database",
      title: t("INSTALLATION_STEP4_TITLE"),
      description: t("INSTALLATION_STEP4_DESC"),
      code: `# Generate database schema
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Open database studio (optional)
pnpm db:studio`,
      terminal: true,
    },
    {
      id: "dev",
      title: t("INSTALLATION_STEP5_TITLE"),
      description: t("INSTALLATION_STEP5_DESC"),
      code: `# Start the development server
pnpm dev

# Server will be available at:
# http://localhost:3000`,
      terminal: true,
    },
  ];

  return (
    <section className="bg-white dark:bg-dark--theme-950 transition-colors duration-300">
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              {t("INSTALLATION_GUIDE_TITLE")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
              {t("INSTALLATION_GUIDE_SUBTITLE")}
            </p>
          </div>

          {/* Steps Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {installationSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeStep === step.id
                    ? "bg-theme-primary-600 dark:bg-theme-primary-500 text-white shadow-lg shadow-theme-primary-500/25"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {step.title.split(".")[0]}
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
                    activeStep === step.id ? "block" : "hidden"
                  }`}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed transition-colors duration-300">
                      {step.description}
                    </p>

                    {/* Progress */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
                        <div
                          className="bg-theme-primary-600 dark:bg-theme-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((installationSteps.findIndex((s) => s.id === step.id) + 1) / installationSteps.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
                        {installationSteps.findIndex((s) => s.id === step.id) +
                          1}{" "}
                        {t("INSTALLATION_OF")} {installationSteps.length}
                      </span>
                    </div>

                    {/* Next Step Button */}
                    {installationSteps.findIndex((s) => s.id === step.id) <
                      installationSteps.length - 1 && (
                      <button
                        onClick={() => {
                          const currentIndex = installationSteps.findIndex(
                            (s) => s.id === step.id
                          );
                          setActiveStep(installationSteps[currentIndex + 1].id);
                        }}
                        className="bg-theme-primary-600 dark:bg-theme-primary-500 hover:bg-theme-primary-700 dark:hover:bg-theme-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-theme-primary-500/25 hover:shadow-theme-primary-500/40 transform hover:scale-105"
                      >
                        {t("INSTALLATION_NEXT_STEP")}
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
                    activeStep === step.id ? "block" : "hidden"
                  }`}
                >
                  {step.code && (
                    <div className="bg-gray-900 dark:bg-gray-950 rounded-lg border border-gray-700 dark:border-gray-800 overflow-hidden shadow-xl transition-all duration-300">
                      {/* Terminal Header */}
                      <div className="bg-gray-800 dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700 dark:border-gray-800 transition-all duration-300">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="text-gray-400 dark:text-gray-500 text-sm font-mono transition-colors duration-300">
                          {step.terminal ? t("INSTALLATION_TERMINAL") : t("INSTALLATION_CODE")}
                        </div>
                        <div className="w-12"></div>
                      </div>

                      {/* Code Content */}
                      <div className="p-4 font-mono text-sm">
                        <pre className="text-gray-300 dark:text-gray-400 leading-relaxed transition-colors duration-300">
                          <code>
                            {step.code.split("\n").map((line, index) => (
                              <div key={index} className="flex">
                                <span className="text-gray-600 dark:text-gray-500 mr-4 select-none w-8 text-right transition-colors duration-300">
                                  {index + 1}
                                </span>
                                <span
                                  className={`transition-colors duration-300 ${
                                    line.startsWith("#")
                                      ? "text-gray-500 dark:text-gray-600"
                                      : line.startsWith("pnpm") ||
                                          line.startsWith("npm") ||
                                          line.startsWith("yarn")
                                        ? "text-green-400 dark:text-green-500"
                                        : line.startsWith("git")
                                          ? "text-blue-400 dark:text-blue-500"
                                          : line.startsWith("cp")
                                            ? "text-yellow-400 dark:text-yellow-500"
                                            : line.includes("http://")
                                              ? "text-cyan-400 dark:text-cyan-500"
                                              : "text-gray-300 dark:text-gray-400"
                                  }`}
                                >
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
                    <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-300">
                        <div className="text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          <svg
                            className="w-16 h-16 mx-auto mb-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
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
          <div className="mt-12 bg-gradient-to-r from-theme-primary-50 to-theme-secondary-50 dark:from-theme-primary-900/20 dark:to-theme-secondary-900/20 rounded-2xl p-6 border border-theme-primary-200 dark:border-theme-primary-800 transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              {t("INSTALLATION_QUICK_START_TIPS")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{t("INSTALLATION_TIP1_TITLE")}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">
                    {t("INSTALLATION_TIP1_DESC")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300">
                  <span className="text-white text-sm">⚡</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{t("INSTALLATION_TIP2_TITLE")}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">
                    Run{" "}
                    <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded text-theme-primary-600 dark:text-theme-primary-400 transition-all duration-300">
                      pnpm check-env
                    </code>{" "}
                    {t("INSTALLATION_TIP2_DESC")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300">
                  <span className="text-white text-sm">🔧</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{t("INSTALLATION_TIP3_TITLE")}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">
                    {t("INSTALLATION_TIP3_DESC")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
