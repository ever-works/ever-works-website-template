import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientProfileById, getLastLoginActivity } from "@/lib/db/queries";
import { type ClientProfile } from "@/lib/db/schema";
import { Link } from "@/i18n/navigation";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import {
  ArrowLeft,
  Mail,
  User,
  Building2,
  Globe,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Clock,
  Languages,
  Star,
  ExternalLink,
  Edit
} from "lucide-react";

type Params = { id: string; locale?: string };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, locale: paramLocale } = await params;

  const session = await auth();
  if (!session?.user?.isAdmin) {
    const locale = paramLocale || "en";
    redirect(`/${locale}/auth/signin`);
  }

  const profile: ClientProfile | null = await getClientProfileById(id);
  if (!profile) {
    notFound();
  }

  const lastLogin = await getLastLoginActivity(profile.id, 'client');

  const locale = paramLocale || "en";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Gradient Header */}
      <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href={`/${encodeURIComponent(locale)}/admin/clients`}
              className="inline-flex items-center px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded transition-colors"
            >
              <ArrowLeft aria-hidden="true" className="w-4 h-4 mr-1" />
              Back to Clients
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                href={`/${encodeURIComponent(locale)}/admin/clients?edit=${encodeURIComponent(profile.id)}`}
                className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-theme-primary to-theme-accent text-white shadow-lg hover:shadow-xl rounded transition-all duration-300"
              >
                <Edit aria-hidden="true" className="w-4 h-4 mr-1" />
                Edit Client
              </Link>
            </div>
          </div>

          {/* Client Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-2xl font-bold text-white">
                      {(profile.displayName || profile.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {profile.displayName || profile.username || 'Unnamed Client'}
                    </h1>
                    {profile.company && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        {profile.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                      #{profile.id.slice(0, 8)}
                    </span>
                    <Chip size="sm" color={getStatusColor(profile.status || 'active')} variant="flat" className="shadow-sm">
                      {(profile.status || 'active').charAt(0).toUpperCase() + (profile.status || 'active').slice(1)}
                    </Chip>
                    <Chip size="sm" color={getPlanColor(profile.plan || 'free')} variant="flat" className="shadow-sm">
                      {(profile.plan || 'free').charAt(0).toUpperCase() + (profile.plan || 'free').slice(1)}
                    </Chip>
                  </div>
                  {profile.jobTitle && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {profile.jobTitle}
                    </p>
                  )}
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar aria-hidden="true" className="w-4 h-4" />
                      <span>Joined {toDateTime(profile.createdAt, locale)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star aria-hidden="true" className="w-4 h-4" />
                      <span>{profile.totalSubmissions || 0} submissions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock aria-hidden="true" className="w-4 h-4" />
                      <span>Last login {lastLogin ? toDateTime(lastLogin.timestamp, locale) : 'Never'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardBody className="p-0">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center space-x-3">
                    <User aria-hidden="true" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernField
                      icon={<User aria-hidden="true" className="w-4 h-4 text-blue-500" />}
                      label="Display Name"
                      value={profile.displayName || "Not provided"}
                    />
                    <ModernField
                      icon={<User aria-hidden="true" className="w-4 h-4 text-green-500" />}
                      label="Username"
                      value={profile.username ? `@${profile.username}` : "Not set"}
                    />
                    <ModernField
                      icon={<Building2 aria-hidden="true" className="w-4 h-4 text-purple-500" />}
                      label="Company"
                      value={profile.company || "Not provided"}
                    />
                    <ModernField
                      icon={<Building2 aria-hidden="true" className="w-4 h-4 text-orange-500" />}
                      label="Job Title"
                      value={profile.jobTitle || "Not provided"}
                    />
                    <ModernField
                      icon={<Shield aria-hidden="true" className="w-4 h-4 text-indigo-500" />}
                      label="Account Type"
                      value={(profile.accountType || 'individual').charAt(0).toUpperCase() + (profile.accountType || 'individual').slice(1)}
                    />
                    <ModernField
                      icon={<CreditCard aria-hidden="true" className="w-4 h-4 text-pink-500" />}
                      label="Subscription Plan"
                      value={(profile.plan || 'free').charAt(0).toUpperCase() + (profile.plan || 'free').slice(1)}
                    />
                  </div>
                  {profile.bio && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-2 mb-3">
                        <User aria-hidden="true" className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Bio</span>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {profile.bio}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardBody className="p-0">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center space-x-3">
                    <Mail aria-hidden="true" className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact & Details</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernField
                      icon={<Phone aria-hidden="true" className="w-4 h-4 text-green-500" />}
                      label="Phone"
                      value={profile.phone || "Not provided"}
                    />
                    <ModernField
                      icon={<Globe aria-hidden="true" className="w-4 h-4 text-blue-500" />}
                      label="Website"
                      value={profile.website || "Not provided"}
                      isLink={!!profile.website}
                    />
                    <ModernField
                      icon={<MapPin aria-hidden="true" className="w-4 h-4 text-red-500" />}
                      label="Location"
                      value={profile.location || "Not provided"}
                    />
                    <ModernField
                      icon={<Building2 aria-hidden="true" className="w-4 h-4 text-purple-500" />}
                      label="Industry"
                      value={profile.industry || "Not specified"}
                    />
                    <ModernField
                      icon={<Languages aria-hidden="true" className="w-4 h-4 text-orange-500" />}
                      label="Language"
                      value={profile.language?.toUpperCase() || "EN"}
                    />
                    <ModernField
                      icon={<Clock aria-hidden="true" className="w-4 h-4 text-indigo-500" />}
                      label="Timezone"
                      value={profile.timezone || "UTC"}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Account Status */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardBody className="p-0">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center space-x-3">
                    <Shield aria-hidden="true" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security & Status</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <Mail aria-hidden="true" className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Email Verified</span>
                    </div>
                    <Chip
                      size="sm"
                      color={profile.emailVerified ? 'success' : 'danger'}
                      variant="flat"
                      className="shadow-sm"
                    >
                      {profile.emailVerified ? 'Verified' : 'Unverified'}
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <Shield aria-hidden="true" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Two-Factor Auth</span>
                    </div>
                    <Chip
                      size="sm"
                      color={profile.twoFactorEnabled ? 'success' : 'default'}
                      variant="flat"
                      className="shadow-sm"
                    >
                      {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Chip>
                  </div>
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {profile.totalSubmissions || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Submissions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Billing & Subscription */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardBody className="p-0">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center space-x-3">
                    <CreditCard aria-hidden="true" className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing & Plans</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CreditCard aria-hidden="true" className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No billing setup</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                      Payment and subscription details will appear here once configured.
                    </p>
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Set up billing
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModernField({
  icon,
  label,
  value,
  isLink = false
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  isLink?: boolean;
}) {
  return (
    <div className="p-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-3 mb-2">
        {icon}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-gray-900 dark:text-white font-medium">
        {isLink && value && value !== "Not provided" ? (
          <a
            href={/^https?:\/\//i.test(value) || value.startsWith('mailto:') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>{value}</span>
            <ExternalLink aria-hidden="true" className="w-3 h-3" />
          </a>
        ) : (
          value || "—"
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    case 'suspended':
      return 'danger';
    case 'trial':
      return 'warning';
    default:
      return 'default';
  }
}

function getPlanColor(plan: string) {
  switch (plan) {
    case 'premium':
      return 'success';
    case 'standard':
      return 'primary';
    case 'free':
      return 'default';
    default:
      return 'default';
  }
}

function toDateTime(date: unknown, locale: string = "en"): string {
  try {
    if (!date) return "—";
    const d = new Date(String(date));
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}