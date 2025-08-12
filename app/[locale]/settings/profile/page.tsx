import { redirect } from "next/navigation";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function SettingsCard({ title, description, icon, href }: SettingsCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="h-full hover:shadow-lg hover:shadow-theme-primary-500/10 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:scale-[1.02] cursor-pointer group-hover:border-theme-primary-300 dark:group-hover:border-theme-primary-600 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-theme-primary-100 to-theme-primary-200 dark:from-theme-primary-900/40 dark:to-theme-primary-800/40 rounded-xl flex items-center justify-center group-hover:from-theme-primary-200 group-hover:to-theme-primary-300 dark:group-hover:from-theme-primary-800/60 dark:group-hover:to-theme-primary-700/60 transition-all duration-300 shadow-sm">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg group-hover:text-theme-primary-700 dark:group-hover:text-theme-primary-400 transition-colors mb-1">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-theme-primary-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ProfileSettingsPage() {
  // Redirect old settings route to new client settings route
  redirect('/client/settings');
}
