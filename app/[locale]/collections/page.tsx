import { getCachedItems } from "@/lib/content";
import CollectionsGridClient from "./collections-grid-client";

export const revalidate = 10;

// Allow non-English locales to be generated on-demand (ISR)
export const dynamicParams = true;

export async function generateStaticParams() {
  // Only pre-build English locale for optimal build size
  return [{ locale: 'en' }];
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch collections from content
  const { collections } = await getCachedItems({ lang: locale });

  // Fallback to mock data if no collections.yml exists yet
  const collectionsData = collections.length > 0 ? collections : [
    {
      id: "1",
      slug: "ai-tools",
      name: "AI & Machine Learning Tools",
      description: "Discover powerful AI and machine learning tools to enhance your projects. From neural networks to natural language processing, find the best open source solutions.",
      icon_url: "🤖",
      item_count: 24,
      isActive: true,
    },
    {
      id: "2",
      slug: "dev-tools",
      name: "Developer Tools",
      description: "Essential tools every developer needs. IDEs, version control, debugging tools, and productivity enhancers to streamline your development workflow.",
      icon_url: "🛠️",
      item_count: 42,
      isActive: true,
    },
    {
      id: "3",
      slug: "web-frameworks",
      name: "Web Frameworks",
      description: "Modern web frameworks for building scalable applications. From frontend libraries to full-stack solutions, explore frameworks that power the web.",
      icon_url: "🌐",
      item_count: 18,
      isActive: true,
    },
    {
      id: "4",
      slug: "data-science",
      name: "Data Science & Analytics",
      description: "Tools and libraries for data analysis, visualization, and scientific computing. Transform raw data into actionable insights with these powerful solutions.",
      icon_url: "📊",
      item_count: 31,
      isActive: true,
    },
    {
      id: "5",
      slug: "cloud-native",
      name: "Cloud Native Tools",
      description: "Build, deploy, and manage cloud-native applications. Container orchestration, service mesh, monitoring, and other tools for modern cloud infrastructure.",
      icon_url: "☁️",
      item_count: 27,
      isActive: true,
    },
    {
      id: "6",
      slug: "security",
      name: "Security & Privacy",
      description: "Protect your applications and data with these security tools. From encryption libraries to vulnerability scanners, stay secure with open source solutions.",
      icon_url: "🔒",
      item_count: 19,
      isActive: true,
    },
    {
      id: "7",
      slug: "mobile-dev",
      name: "Mobile Development",
      description: "Cross-platform and native mobile development frameworks. Build stunning iOS and Android apps with React Native, Flutter, and other modern tools.",
      icon_url: "📱",
      item_count: 35,
      isActive: true,
    },
    {
      id: "8",
      slug: "devops",
      name: "DevOps & CI/CD",
      description: "Automate your deployment pipeline with CI/CD tools, infrastructure as code, and DevOps best practices for faster, more reliable releases.",
      icon_url: "🚀",
      item_count: 29,
      isActive: true,
    },
    {
      id: "9",
      slug: "databases",
      name: "Databases & Storage",
      description: "Relational, NoSQL, and distributed databases. From PostgreSQL to MongoDB, find the right data storage solution for your application.",
      icon_url: "💾",
      item_count: 22,
      isActive: true,
    },
    {
      id: "10",
      slug: "testing",
      name: "Testing & QA",
      description: "Unit testing, integration testing, and end-to-end testing frameworks. Ensure code quality with comprehensive testing tools.",
      icon_url: "🧪",
      item_count: 16,
      isActive: true,
    },
    {
      id: "11",
      slug: "ui-libraries",
      name: "UI Component Libraries",
      description: "Pre-built UI components and design systems. Speed up development with beautiful, accessible component libraries for React, Vue, and more.",
      icon_url: "🎨",
      item_count: 38,
      isActive: true,
    },
    {
      id: "12",
      slug: "monitoring",
      name: "Monitoring & Observability",
      description: "Application performance monitoring, logging, and tracing tools. Keep your systems healthy with real-time insights and alerts.",
      icon_url: "📈",
      item_count: 14,
      isActive: true,
    },
    {
      id: "13",
      slug: "api-tools",
      name: "API Development",
      description: "REST, GraphQL, and gRPC tools for building robust APIs. Documentation generators, testing tools, and API gateways for modern backends.",
      icon_url: "🔌",
      item_count: 26,
      isActive: true,
    },
  ];

  return <CollectionsGridClient collections={collectionsData} locale={locale} />;
}
