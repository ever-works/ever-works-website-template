"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signInAction, signUp } from "../actions";
import { ActionState } from "@/lib/auth/middleware";
import { PropsWithChildren, useActionState, useEffect, useState } from "react";
import { User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button, cn } from "@heroui/react";
import { useConfig } from "../../config";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CredentialsForm({
  type,
  children,
  hideSwitchButton = false,
  onSuccess,
}: PropsWithChildren<{ type: "login" | "signup", hideSwitchButton?: boolean, onSuccess?: () => void }>) {
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
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirect || "/dashboard");
        router.refresh();
      }
    }
  }, [state, redirect, router, onSuccess]);

  const handleFormAction = async (formData: FormData) => {
    formData.append('authProvider', config.authConfig?.provider || 'next-auth');
    return formAction(formData);
  };

  return (
    <>
      {/* Modern header with animation */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center shadow-xl shadow-theme-primary/25 animate-pulse-subtle">
              <User className="text-white w-8 h-8" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isLogin ? t("SIGN_IN") : t("CREATE_ACCOUNT")}
          </h1>
          {auth.credentials && (
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
              {isLogin
                ? t("ENTER_YOUR_CREDENTIALS_HEADER")
                : t("FILL_IN_OUR_DIRECTORY")}
            </p>
          )}
        </div>

        {/* Progress indicator for signup */}
        {!isLogin && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-theme-primary rounded-full"></div>
              <span className="text-xs text-theme-primary font-medium">Step 1</span>
            </div>
            <div className="w-8 h-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <span className="text-xs text-gray-400">Verification</span>
            </div>
          </div>
        )}
      </div>

      {auth.credentials && (
        <form
          className="space-y-5 animate-fade-in"
          action={handleFormAction}
          aria-label={isLogin ? t("SIGN_IN") : t("CREATE_ACCOUNT")}
        >
          {/* Name field (signup only) */}
      {!isLogin && (
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t("FULL_NAME")}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <User className="h-4 w-4 text-gray-400 group-focus-within:text-theme-primary transition-colors" />
            </div>
            <input
              id="name"
              type="text"
              className={cn(
                "pl-10 pr-4 w-full py-3 border-2 rounded-lg transition-all duration-200",
                "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                "border-gray-200 dark:border-gray-700",
                "focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:text-sm",
                "shadow-sm hover:shadow-md focus:shadow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              )}
              placeholder={t("ENTER_YOUR_FULL_NAME")}
              name="name"
              defaultValue={state?.name}
              required
              autoComplete="name"
              aria-describedby="name-error"
            />
          </div>
        </div>
      )}

          {/* Email field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t("EMAIL_ADDRESS")}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-theme-primary transition-colors" />
          </div>
          <input
            id="email"
            type="email"
            className={cn(
              "pl-10 pr-4 w-full py-3 border-2 rounded-lg transition-all duration-200",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
              "border-gray-200 dark:border-gray-700",
              "focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:text-sm",
              "shadow-sm hover:shadow-md focus:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            )}
            placeholder={t("ENTER_YOUR_EMAIL")}
            name="email"
            defaultValue={state?.email}
            required
            autoComplete="email"
            aria-describedby="email-error"
          />
        </div>
      </div>

          {/* Password field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t("PASSWORD")}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-theme-primary transition-colors" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className={cn(
              "pl-10 pr-10 w-full py-3 border-2 rounded-lg transition-all duration-200",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
              "border-gray-200 dark:border-gray-700",
              "focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:text-sm",
              "shadow-sm hover:shadow-md focus:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            )}
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
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-theme-primary transition-colors z-10"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {/* Password tips for signup */}
        {!isLogin && showPasswordTips && (
          <div id="password-tips" className="mt-3 p-4 bg-theme-primary/5 border border-theme-primary/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-theme-primary/10 rounded-full flex items-center justify-center mt-0.5">
                <Lock className="w-3 h-3 text-theme-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Security Requirements
                </h4>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-theme-primary rounded-full"></div>
                    <span>At least 8 characters</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-theme-primary rounded-full"></div>
                    <span>One uppercase and lowercase letter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-theme-primary rounded-full"></div>
                    <span>One number and special character</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern error and success messages */}
      {state?.error && (
        <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              Connection Error
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              {state?.error}
            </p>
          </div>
        </div>
      )}

      {state?.success && (
        <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
              {isLogin ? "Login Successful!" : "Account Created Successfully!"}
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              {isLogin ? "Redirecting..." : "You can now sign in."}
            </p>
          </div>
        </div>
      )}

      {/* Forgot password link (login only) */}
      {isLogin && (
        <div className="flex items-center justify-center">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-theme-primary hover:text-theme-primary/80 transition-colors hover:underline"
          >
            {t("FORGOT_PASSWORD")}
          </Link>
        </div>
      )}

      {/* Modern submit button */}
      <Button
        type="submit"
        className={cn(
          "w-full h-12 bg-gradient-to-r from-theme-primary to-theme-accent text-white font-semibold rounded-xl",
          "hover:from-theme-primary/90 hover:to-theme-accent/90 focus:outline-none",
          "focus:ring-4 focus:ring-theme-primary/20 transition-all duration-200",
          "shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed",
          "transform hover:scale-[1.02] active:scale-[0.98]"
        )}
        isLoading={pending && !state.success}
        aria-busy={pending && !state.success}
        aria-disabled={pending && !state.success}
      >
        {pending && !state.success ? (
          <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
        ) : state.success ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{isLogin ? "Signed in!" : "Account created!"}</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>{isLogin ? t("SIGN_IN") : t("CREATE_ACCOUNT")}</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        )}
      </Button>
    </form>
      )}

      {children}

      {auth.credentials && !hideSwitchButton && (
        <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {isLogin ? "New to our platform?" : "Already have an account?"}
          </p>
          <Button
            as={Link}
            className={cn(
              "text-theme-primary hover:text-theme-primary/80 text-sm font-semibold",
              "hover:bg-theme-primary/5 px-4 py-2 rounded-lg transition-all duration-200",
              "border border-theme-primary/20 hover:border-theme-primary/40"
            )}
            href={isLogin ? "/auth/register" : "/auth/signin"}
            variant="flat"
          >
            {isLogin ? (
              <span className="flex items-center gap-2">
                <span>Create account</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Sign in</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </span>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
