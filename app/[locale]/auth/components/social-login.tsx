"use client";

import { Button } from "@heroui/react";
import { useConfig } from "../../config";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import {
  IconFacebook,
  IconGithub,
  IconGoogle,
  IconMicrosoft,
  IconX,
} from "@/components/icons/Icons";
import { useActionState, useEffect } from "react";
import { signInWithProvider } from "../actions";
import { ActionState } from "@/lib/auth/middleware";
import { signIn } from "next-auth/react";

type SocialProvider = {
  icon: React.ReactNode;
  provider: string;
  isEnabled: boolean;
};

export function SocialLogin() {
  const t = useTranslations("common");
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const router = useRouter();
  const config = useConfig();
  const auth = config.auth || {};
  const authProvider = config.authConfig?.provider || "next-auth";
  
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signInWithProvider,
    {}
  );

  const socialProviders: SocialProvider[] = [
    { icon: <IconGithub />, provider: "github", isEnabled: !!auth.github },
    { icon: <IconGoogle />, provider: "google", isEnabled: !!auth.google },
    { icon: <IconFacebook />, provider: "facebook", isEnabled: !!auth.fb },
    { icon: <IconX />, provider: "x", isEnabled: !!auth.x },
    { icon: <IconMicrosoft />, provider: "microsoft", isEnabled: !!auth.microsoft },
  ].filter((provider) => provider.isEnabled);

  useEffect(() => {
    if (state.success) {
      router.push(redirectUrl);
      router.refresh();
    }
  }, [state, redirectUrl, router]);

  const enabledProviders = Object.keys(auth)
    .filter((key) => key !== "credentials")
    .filter((key) => auth[key as keyof typeof auth]);

 
  const handleSocialAuth = async (provider: SocialProvider, formData: FormData) => {
    try {
      if (authProvider === "next-auth") {
        await signIn(provider.provider, {
          callbackUrl: redirectUrl,
          redirect: true,
        });
        return;
      } else {
        const safeFormData = new FormData();
        for (const [key, value] of formData.entries()) {
          safeFormData.append(key, value);
        }
        safeFormData.append("provider", provider.provider);
        safeFormData.append("callbackUrl", redirectUrl);
        safeFormData.append("authProvider",config.authConfig?.provider||"supabase");
        return formAction(safeFormData);
      }
    } catch (error) {
      console.error(`Error during authentication with ${provider.provider}:`, error);
    }
  };
  if (enabledProviders.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative my-6 flex items-center">
        <div className="w-full border-t border-gray-300" />
        <div className="relative flex justify-center text-sm px-2">
          <span className="px-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {t("OR_CONTINUE_WITH")}
          </span>
        </div>
        <div className="w-full border-t border-gray-300" />
      </div>

      <div className="flex justify-center items-center gap-5">
        {socialProviders.map((provider, index) => (
          <form 
            key={`social-provider-${provider.provider}-${index}`} 
            action={(formData) => handleSocialAuth(provider, formData)}
          >
            <Button
              name="provider"
              value={provider.provider}
              type="submit"
              isIconOnly
              disabled={pending}
              aria-label={`Se connecter avec ${provider.provider}`}
              className="hover:opacity-80 transition-opacity"
            >
              {provider.icons}
            </Button>
          </form>
        ))}
      </div>
    </>
  );
}
