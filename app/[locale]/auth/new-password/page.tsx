"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { KeyRound, Shield, Eye, EyeOff, XCircle, CheckCircle, Lock, ArrowLeft } from "lucide-react";
import { useConfig } from "../../config";
import { Button, cn } from "@heroui/react";
import { Link } from "@/i18n/navigation";
import { newPasswordAction, verifyPasswordTokenAction } from "../actions";
import { useTranslations } from "next-intl";

export default function NewPasswordPage() {
  const config = useConfig();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const t = useTranslations("admin.NEW_PASSWORD_PAGE");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Password strength criteria
  const passwordCriteria = useMemo(() => {
    return [
      {
        id: "length",
        label: t("AT_LEAST_8_CHARS"),
        test: (pwd: string) => pwd.length >= 8,
      },
      {
        id: "lowercase",
        label: t("LOWERCASE_LETTER"),
        test: (pwd: string) => /[a-z]/.test(pwd),
      },
      {
        id: "uppercase",
        label: t("UPPERCASE_LETTER"),
        test: (pwd: string) => /[A-Z]/.test(pwd),
      },
      { id: "number", label: t("NUMBER"), test: (pwd: string) => /\d/.test(pwd) },
      {
        id: "special",
        label: t("SPECIAL_CHARACTER"),
        test: (pwd: string) => /[!@#$%^&*~(){}[\]|;:'",<>.?]/.test(pwd),
      },
    ];
  }, [t]);

  useEffect(() => {
    if (password) {
      const meetsCount = passwordCriteria.filter((c) =>
        c.test(password)
      ).length;
      setPasswordStrength((meetsCount / passwordCriteria.length) * 100);
    } else {
      setPasswordStrength(0);
    }
  }, [password, passwordCriteria]);

  useEffect(() => {
    let mounted = true;

    const verifyToken = async () => {
      if (!token) {
        setError(t("MISSING_RESET_TOKEN"));
        setIsTokenValid(false);
        setIsLoading(false);
        return;
      }

      try {
        const result = await verifyPasswordTokenAction(token);
        if (result.success && mounted) {
          setIsTokenValid(true);
        } else if (result.error && mounted) {
          setError(result.error);
          setIsTokenValid(false);
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);

        if (mounted) {
          setIsTokenValid(false);
          setIsLoading(false);
          setError(t("ERROR_VERIFYING_TOKEN"));
        }
      }
    };

    verifyToken();

    return () => {
      mounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordStrength < 60) {
      setError(t("CHOOSE_STRONGER_PASSWORD"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("PASSWORDS_DO_NOT_MATCH"));
      return;
    }

    const formData = new FormData(e.currentTarget);
    if (token) {
      formData.append("token", token);
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await newPasswordAction({}, formData);
      if (result.success) {
        setSuccess(true);
      } else if ("error" in result && result.error) {
        setSuccess(false);
        setError(result.error);
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError(t("FAILED_SET_PASSWORD"));
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#1a1f2e] relative overflow-hidden">
      {/* Background decorative elements - matching the forgot password style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large circles */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-gray-500/15 rounded-full blur-2xl" />
        <div className="absolute top-32 left-32 w-32 h-32 bg-gray-600/20 rounded-full blur-xl" />
        <div className="absolute bottom-40 right-40 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        {/* Small decorative elements */}
        <div className="absolute top-24 left-72 w-1 h-1 bg-blue-400/80 rounded-full animate-pulse" />
        <div className="absolute top-40 right-64 w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-56 w-1 h-1 bg-blue-300/70 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="flex min-h-screen">
        {/* Left side - Branding and illustration - matching the forgot password style */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative">
          {/* Illustration area - security themed */}
          <div className="mb-12 flex justify-center relative">
            <div className="relative">
              {/* Main security illustration - lock with key */}
              <div className="w-72 h-44 bg-white rounded-2xl shadow-2xl relative overflow-hidden transform rotate-3">
                {/* Lock body */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-gray-100 rounded-lg"></div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-12 h-12 border-4 border-blue-500 rounded-full bg-transparent"></div>

                {/* Key */}
                <div className="absolute bottom-8 right-8 w-16 h-6 bg-blue-500 rounded-full">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-sm"></div>
                  <div className="absolute right-1 top-1 w-2 h-1 bg-white rounded-sm"></div>
                  <div className="absolute right-1 bottom-1 w-2 h-1 bg-white rounded-sm"></div>
                </div>

                {/* Security indicators */}
                <div className="absolute top-6 left-6 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute top-6 right-6 w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>

              {/* Security badge with shield icon */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>

              {/* Background circles */}
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-gray-400/20 rounded-full blur-sm"></div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gray-500/15 rounded-full blur-sm"></div>
            </div>
          </div>

          {/* Company branding */}
          <div className="mb-10">
            {/* Company logo and name */}
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-bold text-xl">
                  {config.company_name?.charAt(0) || 'E'}
                </span>
              </div>
              <span className="text-white text-xl font-semibold">{config.company_name}</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl font-bold text-white mb-2 leading-tight">
              {t("SECURE_ACCOUNT_ACCESS")}
            </h1>
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              <span className="text-blue-400">{t("ACCOUNT_ACCESS")}</span>
            </h2>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
              {t("DESCRIPTION")}
            </p>
          </div>

          {/* Security features list */}
          <div className="space-y-6">
            {/* Strong Password */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mr-4 mt-1">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-lg mb-1">{t("STRONG_PASSWORD_PROTECTION")}</div>
                <div className="text-gray-400 text-sm">{t("ADVANCED_ENCRYPTION")}</div>
              </div>
            </div>

            {/* Account Security */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mr-4 mt-1">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-lg mb-1">{t("ACCOUNT_SECURITY")}</div>
                <div className="text-gray-400 text-sm">{t("MULTI_LAYER_PROTECTION")}</div>
              </div>
            </div>

            {/* Secure Access */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mr-4 mt-1">
                <KeyRound className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-lg mb-1">{t("SECURE_ACCESS")}</div>
                <div className="text-gray-400 text-sm">{t("PROTECTED_LOGIN")}</div>
              </div>
            </div>
          </div>

          {/* SSL Badge */}
          <div className="mt-8 flex items-center text-gray-400 text-sm">
            <Shield className="w-4 h-4 mr-2" />
            {t("SECURED_BY_SSL")}
          </div>
        </div>

        {/* Right side - Form - matching the forgot password style */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-sm">
            {isLoading && !success ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                <p className="text-gray-400 text-lg">{t("PROCESSING")}</p>
              </div>
            ) : !isTokenValid && !success ? (
              <div className="space-y-6 text-center">
                {/* Error icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-2xl mb-6 shadow-lg">
                  <XCircle className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">
                    {t("VERIFICATION_FAILED")}
                  </h3>
                  <p className="text-gray-400 text-base">
                    {t("LINK_EXPIRED")}
                  </p>
                </div>

                <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl backdrop-blur-sm">
                  <p className="text-red-300 text-sm">
                    {error || t("TOKEN_INVALID")}
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    as={Link}
                    href="/auth/forgot-password"
                    size="lg"
                    radius="lg"
                    className="w-full h-14 font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
{t("REQUEST_NEW_RESET_LINK")}
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      <ArrowLeft className="h-4 w-4" />
{t("RETURN_TO_LOGIN")}
                    </Link>
                  </div>
                </div>
              </div>
            ) : success ? (
              <div className="space-y-6 text-center">
                {/* Success icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-6 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">
                    {t("PASSWORD_UPDATED")}
                  </h3>
                  <p className="text-gray-400 text-base">
                    {t("PASSWORD_SUCCESS_MESSAGE")}
                  </p>
                </div>

                <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-xl backdrop-blur-sm">
                  <p className="text-green-300 text-sm">
                    {t("ACCOUNT_SECURE_MESSAGE")}
                  </p>
                </div>

                <Button
                  as={Link}
                  href="/auth/signin"
                  size="lg"
                  radius="lg"
                  className="w-full h-14 font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
{t("GO_TO_LOGIN")}
                </Button>
              </div>
            ) : (
              <>
                {/* Header with icon */}
                <div className="text-center mb-8">
                  {/* Lock icon with key indicator */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6 relative shadow-lg">
                    <Lock className="w-8 h-8 text-white" />
                    {/* Key indicator */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                      <KeyRound className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-white mb-3">
                    {t("TITLE")}
                  </h1>
                  <p className="text-gray-400 text-base">
                    {t("SUBTITLE")}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password field */}
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium flex items-center gap-1">
                      {t("NEW_PASSWORD_LABEL")}
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("ENTER_NEW_PASSWORD")}
                        name="newPassword"
                        required
                        className="w-full h-14 bg-gray-800/50 border border-gray-600/50 rounded-xl pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800/70 transition-all duration-200"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Password strength meter */}
                    {password && (
                      <div className="mt-3 space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-300">{t("PASSWORD_STRENGTH")}</span>
                          <span
                            className={
                              passwordStrength >= 80
                                ? "text-green-400"
                                : passwordStrength >= 60
                                ? "text-blue-400"
                                : passwordStrength >= 40
                                ? "text-yellow-400"
                                : "text-red-400"
                            }
                          >
                            {passwordStrength >= 80
                              ? t("STRONG")
                              : passwordStrength >= 60
                              ? t("GOOD")
                              : passwordStrength >= 40
                              ? t("FAIR")
                              : t("WEAK")}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              passwordStrength >= 80
                                ? "bg-green-500"
                                : passwordStrength >= 60
                                ? "bg-blue-500"
                                : passwordStrength >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            )}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>

                        {/* Password criteria checklist */}
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          {passwordCriteria.map((criterion) => (
                            <div
                              key={criterion.id}
                              className="flex items-center space-x-2"
                            >
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full transition-colors duration-200",
                                  criterion.test(password)
                                    ? "bg-green-500"
                                    : "bg-gray-600"
                                )}
                              />
                              <span
                                className={cn(
                                  "transition-colors duration-200",
                                  criterion.test(password)
                                    ? "text-green-400"
                                    : "text-gray-400"
                                )}
                              >
                                {criterion.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium flex items-center gap-1">
                      {t("CONFIRM_PASSWORD_LABEL")}
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("CONFIRM_NEW_PASSWORD")}
                        name="confirmPassword"
                        required
                        className="w-full h-14 bg-gray-800/50 border border-gray-600/50 rounded-xl pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800/70 transition-all duration-200"
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{t("PASSWORDS_DO_NOT_MATCH")}</p>
                    )}
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl backdrop-blur-sm">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit button */}
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    size="lg"
                    radius="lg"
                    className="w-full h-14 font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    disabled={passwordStrength < 60 || password !== confirmPassword}
                  >
                    {isLoading ? t("SETTING_PASSWORD") : t("SET_NEW_PASSWORD")}
                  </Button>

                  {/* Back to login */}
                  <div className="text-center pt-4 border-t border-gray-700/50">
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      <ArrowLeft className="h-4 w-4" />
{t("BACK_TO_LOGIN")}
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom left avatar - matching the forgot password style */}
      <div className="absolute bottom-6 left-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">N</span>
        </div>
      </div>

      {/* Bottom right avatar - matching the forgot password style */}
      <div className="absolute bottom-6 right-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
