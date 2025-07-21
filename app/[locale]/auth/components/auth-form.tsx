"use client";

import { Search, Building, Globe } from "lucide-react";
import { useConfig } from "../../config";
import { CredentialsForm } from "./credentials-form";
import { SocialLogin } from "./social-login";
import { AnimatedContainer, StaggerContainer } from "@/components/ui/animations";
import { useTranslations } from "next-intl";
import {
  LoginIllustration,
  SignupIllustration,
  AnimatedBackground,
  GeometricDecoration,
  TrustBadge
} from "@/components/ui/auth-illustrations";

export function AuthForm({ form }: { form: "login" | "signup" }) {
  const config = useConfig();
  const t = useTranslations("common");
  const isLogin = form === "login";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gray-50 dark:bg-gray-900">
      {/* Animated background */}
      <AnimatedBackground />
      <GeometricDecoration />
      {/* Main container with modern design */}
      <AnimatedContainer type="scaleIn" duration="slow" easing="bounce">
        <div className="w-full max-w-5xl mx-auto rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[600px]">
            {/* Illustration and branding side */}
            <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-theme-primary/5 via-theme-accent/5 to-theme-secondary/5 p-8 lg:p-12 flex flex-col justify-center">
              {/* Main illustration */}
              <div className="flex-1 flex items-center justify-center mb-8 lg:mb-0">
                <AnimatedContainer type="fadeIn" delay={300}>
                  {isLogin ? (
                    <LoginIllustration className="w-full max-w-sm" />
                  ) : (
                    <SignupIllustration className="w-full max-w-sm" />
                  )}
                </AnimatedContainer>
              </div>

              {/* Informational content */}
              <div className="space-y-6">
                <AnimatedContainer type="slideUp" delay={500}>
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
                      {isLogin ? (
                        <>
                          {t("WELCOME_BACK")} <br />
                          <span className="text-theme-primary">{t("AMONG_US")}</span>
                        </>
                      ) : (
                        <>
                          {t("JOIN_OUR")} <br />
                          <span className="text-theme-primary">{t("COMMUNITY")}</span>
                        </>
                      )}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                      {isLogin
                        ? t("ACCESS_THOUSANDS")
                        : t("CREATE_ACCOUNT_DESC")}
                    </p>
                  </div>
                </AnimatedContainer>

                {/* Feature list with staggered animations */}
                <StaggerContainer staggerDelay={150} className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-theme-primary/10 p-3 rounded-xl mr-4 group hover:bg-theme-primary/20 transition-colors">
                      <Search className="h-5 w-5 text-theme-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">
                        {t("ADVANCED_SEARCH")}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("EXPLORE_THOUSANDS")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-theme-accent/10 p-3 rounded-xl mr-4 group hover:bg-theme-accent/20 transition-colors">
                      <Building className="h-5 w-5 text-theme-accent group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">
                        {t("LIST_YOUR_BUSINESS")}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("INCREASE_VISIBILITY")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-theme-secondary/10 p-3 rounded-xl mr-4 group hover:bg-theme-secondary/20 transition-colors">
                      <Globe className="h-5 w-5 text-theme-secondary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">
                        {t("PROFESSIONAL_NETWORK")}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("CONNECT_WITH_EXPERTS")}
                      </span>
                    </div>
                  </div>
                </StaggerContainer>

                {/* Trust badge */}
                <AnimatedContainer type="fadeIn" delay={800}>
                  <div className="flex items-center justify-center lg:justify-start pt-4">
                    <TrustBadge />
                  </div>
                </AnimatedContainer>
              </div>
            </div>

            {/* Form side */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="max-w-sm mx-auto w-full">
                <AnimatedContainer type="slideLeft" delay={400}>
                  <CredentialsForm type={form}>
                    <SocialLogin />
                  </CredentialsForm>
                </AnimatedContainer>
              </div>
            </div>
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
}
