import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { FiShield, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { ChangePasswordForm } from "@/components/settings/security/change-password-form";


export default function SecuritySettingsPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Container maxWidth="7xl" padding="default">
        <div className="space-y-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/settings/profile"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Settings
            </Link>
          </div>

          {/* Change Password Section */}
          <div id="change-password" className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Change Your Password
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Choose a strong password that you haven&apos;t used elsewhere. We&apos;ll send you a confirmation email once your password is changed.
              </p>
            </div>
            <ChangePasswordForm />
          </div>

          {/* Login Activity Section */}
          <div id="login-activity" className="max-w-3xl mx-auto mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Login Activity
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Review recent login attempts and active sessions to monitor your account security.
              </p>
            </div>
          </div>

          {/* Security Tips */}
          <div className="max-w-3xl mx-auto mt-12">
            <Card className="border border-theme-primary-200 dark:border-theme-primary-800 bg-theme-primary-50 dark:bg-theme-primary-10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-theme-primary-900 dark:text-theme-primary-100 mb-3 flex items-center gap-2">
                  <FiShield className="w-5 h-5" />
                  Security Tips
                </h3>
                <ul className="space-y-2 text-theme-primary-800 dark:text-theme-primary-200 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Use a unique password that you don&apos;t use for other accounts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Include a mix of uppercase, lowercase, numbers, and special characters
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Consider enabling two-factor authentication for extra security
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Regularly review your login activity and active sessions
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
