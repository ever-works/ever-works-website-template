"use client";

import { Mail, ArrowLeft, Shield, Key, CheckCircle, AlertCircle } from "lucide-react";
import { useConfig } from "../../config";
import { useActionState } from "react";
import { Button, Input } from "@heroui/react";
import { ActionState } from "@/lib/auth/middleware";
import { forgotPassword } from "../actions";
import { Link } from "@/i18n/navigation";
import { maskEmail } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const config = useConfig();
  const t = useTranslations("common");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    forgotPassword,
    {}
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gray-50 dark:bg-gray-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-theme-primary/5 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-theme-accent/5 rounded-full blur-3xl animate-pulse-subtle animation-delay-2000" />
      </div>

      {/* Geometric decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-4 h-4 bg-theme-primary/20 rounded-full animate-bounce" />
        <div className="absolute top-20 right-20 w-3 h-3 bg-theme-accent/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-20 left-20 w-5 h-5 bg-theme-secondary/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main container with modern design */}
      <div className="w-full max-w-5xl mx-auto rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden relative z-10">
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Illustration and branding side */}
          <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-theme-primary/5 via-theme-accent/5 to-theme-secondary/5 p-8 lg:p-12 flex flex-col justify-center">
            {/* Password recovery illustration */}
            <div className="flex-1 flex items-center justify-center mb-8 lg:mb-0">
              <div className="relative w-full max-w-sm">
                <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Background elements */}
                  <circle cx="320" cy="80" r="60" fill="var(--theme-primary-100)" opacity="0.3" />
                  <circle cx="80" cy="220" r="40" fill="var(--theme-accent-100)" opacity="0.4" />

                  {/* Key and lock illustration */}
                  <rect x="150" y="120" width="100" height="80" rx="8" fill="var(--theme-primary-200)" opacity="0.2" />
                  <circle cx="200" cy="100" r="25" fill="var(--theme-primary)" opacity="0.1" />
                  <path d="M185 85 L200 75 L215 85 L215 105 C215 115 210 125 200 125 C190 125 185 115 185 105 Z" fill="var(--theme-primary)" />
                  <circle cx="200" cy="95" r="4" fill="white" />

                  {/* Key */}
                  <rect x="160" y="160" width="80" height="8" rx="4" fill="var(--theme-accent)" />
                  <circle cx="170" cy="164" r="12" fill="var(--theme-accent)" />
                  <rect x="220" y="158" width="8" height="4" fill="var(--theme-accent)" />
                  <rect x="220" y="166" width="8" height="4" fill="var(--theme-accent)" />

                  {/* Floating particles */}
                  <circle cx="130" cy="60" r="3" fill="var(--theme-primary)" opacity="0.6">
                    <animate attributeName="cy" values="60;55;60" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="280" cy="180" r="2" fill="var(--theme-accent)" opacity="0.8">
                    <animate attributeName="cy" values="180;175;180" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>

            {/* Informational content */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <div className="w-10 h-10 bg-theme-primary rounded-xl flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">
                      {config.company_name?.charAt(0) || 'E'}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {config.company_name}
                  </span>
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {t("PASSWORD_RECOVERY").split(" ")[0]} <br />
                  <span className="text-theme-primary">{t("PASSWORD_RECOVERY").split(" ")[1]}</span>
                </h2>

                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  Don't worry, it happens to the best of us. Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              {/* Security features */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-theme-primary/10 p-3 rounded-xl mr-4 group hover:bg-theme-primary/20 transition-colors">
                    <Shield className="h-5 w-5 text-theme-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">
                      {t("SECURE_RESET_LINK")}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("ENCRYPTED_TIME_LIMITED")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-theme-accent/10 p-3 rounded-xl mr-4 group hover:bg-theme-accent/20 transition-colors">
                    <Mail className="h-5 w-5 text-theme-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">
                      {t("EMAIL_VERIFICATION")}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("CHECK_INBOX_INSTRUCTIONS")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form side */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="max-w-sm mx-auto w-full">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center shadow-xl shadow-theme-primary/25">
                      <Key className="text-white w-8 h-8" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t("RESET_PASSWORD")}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
                    {t("ENTER_EMAIL_ASSOCIATED")}
                  </p>
                </div>
              </div>

            {state.success ? (
              <div className="space-y-6">
                {/* Success message */}
                <div className="flex items-start space-x-3 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      {t("RECOVERY_EMAIL_SENT")}
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      Check your inbox at{" "}
                      <span className="font-semibold bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                        {maskEmail(state.email)}
                      </span>{" "}
                      for instructions to reset your password.
                    </p>
                  </div>
                </div>

                {/* Help section */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    {t("DIDNT_RECEIVE_EMAIL")}
                  </h5>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-theme-primary rounded-full"></div>
                      <span>Check your spam or junk folder</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-theme-primary rounded-full"></div>
                      <span>Make sure you entered the correct email address</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-theme-primary rounded-full"></div>
                      <span>Wait a few minutes for the email to arrive</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <form action={formAction} className="space-y-6">
                {/* Email field */}
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    label={t("EMAIL_ADDRESS")}
                    placeholder={t("ENTER_EMAIL_ADDRESS")}
                    required
                    isRequired
                    startContent={
                      <Mail className="h-4 w-4 text-gray-400 pointer-events-none flex-shrink-0" />
                    }
                    variant="bordered"
                    size="lg"
                    radius="lg"
                    classNames={{
                      base: "w-full",
                      mainWrapper: "h-full",
                      input: [
                        "bg-transparent",
                        "text-black/90 dark:text-white/90",
                        "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                      ],
                      innerWrapper: "bg-transparent",
                      inputWrapper: [
                        "shadow-xl",
                        "bg-white/70 dark:bg-gray-800/70",
                        "backdrop-blur-xl",
                        "border-2",
                        "border-gray-200 dark:border-gray-700",
                        "hover:border-gray-300 dark:hover:border-gray-600",
                        "focus-within:!border-theme-primary dark:focus-within:!border-theme-primary",
                        "!cursor-text",
                        "group-data-[focus=true]:border-theme-primary",
                        "group-data-[focus=true]:shadow-lg",
                        "group-data-[focus=true]:shadow-theme-primary/25",
                      ],
                      label: [
                        "text-sm font-semibold",
                        "text-gray-700 dark:text-gray-200",
                        "group-data-[filled-within=true]:text-theme-primary",
                        "group-data-[focus=true]:text-theme-primary",
                      ],
                    }}
                    errorMessage={state.error}
                    isInvalid={!!state.error}
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  isLoading={pending}
                  size="lg"
                  radius="lg"
                  className="w-full font-semibold bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 text-white shadow-xl shadow-theme-primary/25 hover:shadow-2xl hover:shadow-theme-primary/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
                  spinner={
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  }
                >
                  {pending ? "Sending..." : t("SEND_RECOVERY_EMAIL")}
                </Button>

                {/* Back to login */}
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-theme-primary dark:hover:text-theme-primary transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("BACK_TO_LOGIN")}
                  </Link>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
