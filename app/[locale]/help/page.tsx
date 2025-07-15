import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { HelpContent } from "./components/help-content";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: "Help & Documentation - Ever Works",
    description: "Learn how to install, configure, and use the Ever Works platform with our comprehensive step-by-step guide.",
    openGraph: {
      title: "Help & Documentation - Ever Works",
      description: "Learn how to install, configure, and use the Ever Works platform with our comprehensive step-by-step guide.",
      type: "website",
    },
  };
}

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("common");

  return (
    <Container maxWidth="7xl" padding="default" className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help & Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn how to install, configure, and use the Ever Works platform with our comprehensive step-by-step guide.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <a href="#getting-started" className="block text-theme-primary-600 dark:text-theme-primary-400 hover:underline">
                1. Getting Started
              </a>
              <a href="#installation" className="block text-theme-primary-600 dark:text-theme-primary-400 hover:underline">
                2. Installation
              </a>
              <a href="#configuration" className="block text-theme-primary-600 dark:text-theme-primary-400 hover:underline">
                3. Configuration
              </a>
            </div>
            <div className="space-y-2">
              <a href="#usage" className="block text-theme-primary-600 dark:text-theme-primary-400 hover:underline">
                4. Usage Guide
              </a>
              <a href="#troubleshooting" className="block text-theme-primary-600 dark:text-theme-primary-400 hover:underline">
                5. Troubleshooting
              </a>
              <a href="#advanced" className="block text-theme-primary-600 dark:text-theme-primary-400 hover:underline">
                6. Advanced Features
              </a>
            </div>
          </div>
        </div>

        {/* Main Help Content */}
        <HelpContent />
      </div>
    </Container>
  );
} 