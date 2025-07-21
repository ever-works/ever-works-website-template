"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signInAction, signUp } from "../actions";
import { ActionState } from "@/lib/auth/middleware";
import { PropsWithChildren, useActionState, useEffect, useState } from "react";
import { User, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button, cn } from "@heroui/react";
import { useConfig } from "../../config";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CredentialsForm({
  type,
  children,
}: PropsWithChildren<{ type: "login" | "signup" }>) {
  const isLogin = type === "login";
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const router = useRouter();
  const config = useConfig();
  const auth = config.auth || {};
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTips, setShowPasswordTips] = useState(false);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isLogin ? signInAction : signUp,
    {}
  );

  useEffect(() => {
    if (state.success) {
      router.push(redirect || "/dashboard");
      router.refresh();
    }
  }, [state, redirect, router]);

  const handleFormAction = async (formData: FormData) => {
    formData.append('provider', config.authConfig?.provider || 'next-auth');
    return formAction(formData);
  };

  return (
    <>
      {/* Branding/logo */}
      <div className="flex flex-col items-center mb-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-2 shadow-lg">
          <User className="text-white w-7 h-7" />
        </div>
      </div>
      <div className="mb-6 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {isLogin ? t("SIGN_IN") : t("CREATE_ACCOUNT")}
        </h1>
        {auth.credentials && (
          <p className="text-gray-500 dark:text-gray-100 text-sm">
            {isLogin
              ? t("ENTER_YOUR_CREDENTIALS_HEADER")
              : t("FILL_IN_OUR_DIRECTORY")}
          </p>
        )}
      </div>

      {auth.credentials && (
        <form
          className="space-y-5 animate-fade-in"
          action={handleFormAction}
          aria-label={isLogin ? t("SIGN_IN") : t("CREATE_ACCOUNT")}
        >
          {/* Name (signup only) */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("FULL_NAME")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  className="pl-10 w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder={t("ENTER_YOUR_FULL_NAME")}
                  name="name"
                  defaultValue={state?.name}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t("EMAIL_ADDRESS")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                className="pl-10 w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder={t("ENTER_YOUR_EMAIL")}
                name="email"
                defaultValue={state?.email}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t("PASSWORD")}
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-24 w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder={t("ENTER_YOUR_PASSWORD")}
                name="password"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                onFocus={() => setShowPasswordTips(!isLogin)}
                onBlur={() => setShowPasswordTips(false)}
                aria-describedby={!isLogin && showPasswordTips ? "password-tips" : undefined}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors text-xs font-medium"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:underline focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            {/* Password tips for signup */}
            {!isLogin && showPasswordTips && (
              <div id="password-tips" className="mt-2 text-xs text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 animate-fade-in">
                <ul className="list-disc pl-5">
                  <li>At least 8 characters</li>
                  <li>One uppercase & one lowercase letter</li>
                  <li>One number & one special character</li>
                </ul>
              </div>
            )}
          </div>

          {/* Error & Success messages */}
          {state?.error && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/30 rounded-lg p-2 border border-red-200 dark:border-red-700 animate-fade-in transition-all duration-300">
              {state?.error}
            </div>
          )}
          {state?.success && (
            <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/30 rounded-lg p-2 border border-green-200 dark:border-green-700 animate-fade-in transition-all duration-300">
              {isLogin ? "Login successful!" : "Account created successfully!"}
            </div>
          )}

          {/* Forgot password (login only) */}
          {isLogin && (
            <div className="flex items-center justify-between my-2">
              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {t("FORGOT_PASSWORD")}
                </Link>
              </div>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            className={cn(
              "w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            )}
            isLoading={pending || !!state.success}
            aria-busy={pending}
            aria-disabled={pending}
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                {isLogin ? t("SIGN_IN") : t("CREATE_ACCOUNT")}
              </span>
            ) : (
              isLogin ? t("SIGN_IN") : t("CREATE_ACCOUNT")
            )}
          </Button>
        </form>
      )}

      {children}

      {auth.credentials && (
        <div className="text-center mt-6">
          <Button
            as={Link}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            href={isLogin ? "/auth/register" : "/auth/signin"}
            variant="flat"
          >
            {isLogin ? t("NEED_AN_ACCOUNT") : t("ALREADY_HAVE_AN_ACCOUNT")}
          </Button>
        </div>
      )}
    </>
  );
}
