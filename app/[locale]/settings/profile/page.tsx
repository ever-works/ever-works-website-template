import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiUser, FiDroplet, FiBriefcase, FiFileText, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function SettingsCard({ title, description, icon, href }: SettingsCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="hover:shadow-xl hover:border-theme-primary-400 border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:scale-[1.025] cursor-pointer group rounded-2xl bg-white/90 dark:bg-gray-900/80">
        <CardContent className="p-7">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-theme-primary-100 dark:bg-theme-primary-900/30 rounded-xl flex items-center justify-center group-hover:bg-theme-primary-200 dark:group-hover:bg-theme-primary-800/50 transition-colors">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg group-hover:text-theme-primary-600 dark:group-hover:text-theme-primary-400 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {description}
                </p>
              </div>
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-theme-primary-500 transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function ProfileSettingsPage() {
  // Bypass auth for testing
  const session = { user: { name: "John Doe", email: "john@example.com" } };

  const settingsCards = [
    {
      title: "Basic Information",
      description: "Update your name, bio, location, and contact details",
      icon: <FiUser className="w-6 h-6 text-theme-primary-600 dark:text-theme-primary-400" />,
      href: "/settings/profile/basic-info",
    },
    {
      title: "Theme & Appearance",
      description: "Customize your profile colors and visual style",
      icon: <FiDroplet className="w-6 h-6 text-theme-primary-600 dark:text-theme-primary-400" />,
      href: "/settings/profile/theme-colors",
    },
    {
      title: "Portfolio Management",
      description: "Add, edit, and organize your portfolio projects",
      icon: <FiBriefcase className="w-6 h-6 text-theme-primary-600 dark:text-theme-primary-400" />,
      href: "/settings/profile/portfolio",
    },
    {
      title: "Submissions",
      description: "Manage your directory submissions and track their status",
      icon: <FiFileText className="w-6 h-6 text-theme-primary-600 dark:text-theme-primary-400" />,
      href: "/settings/profile/submissions",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Container maxWidth="7xl" padding="default">
        <div className="space-y-10 pb-20">
          {/* Section Header */}
          <div className="text-center pt-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
              Profile Settings
            </h1>
            <div className="w-16 h-1 mx-auto bg-theme-primary-400 rounded-full mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Customize your profile appearance, manage your information, and control how others see your profile.
            </p>
          </div>

          {/* Settings Grid Panel */}
          <div className="rounded-2xl bg-white/70 dark:bg-gray-900/60 shadow-lg p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {settingsCards.map((card) => (
                <SettingsCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  href={card.href}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-theme-primary-50/60 dark:bg-theme-primary-900/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/profile/${session.user?.name?.toLowerCase().replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-lg transition-colors"
                >
                  <FiUser className="w-4 h-4" />
                  View My Profile
                </Link>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                  <FiFileText className="w-4 h-4" />
                  Export Profile Data
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
