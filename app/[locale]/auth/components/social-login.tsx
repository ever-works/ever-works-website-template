"use client";

import { Button } from "@heroui/react";
import { useConfig } from "../../config";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconFacebook,
  IconGithub,
  IconGoogle,
  IconMicrosoft,
  IconX,
} from "@/components/icons/Icons";
import { useActionState, useEffect } from "react";
import { ActionState } from "@/lib/auth/middleware";
import { signInWithProvider } from "../actions";

export function SocialLogin() {
  
  const t = useTranslations("common");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const router = useRouter();
  const config = useConfig();
  const auth = config.auth || {};

  const providerIcons = [
    { icons: <IconGithub />, provider: "github", isEnabled: auth.github },
    { icons: <IconGoogle />, provider: "google", isEnabled: auth.google },
    { icons: <IconFacebook />, provider: "facebook", isEnabled: auth.fb },
    { icons: <IconX />, provider: "x", isEnabled: auth.x },
    { icons: <IconMicrosoft />, provider: "microsoft", isEnabled: auth.microsoft },
  ].filter((provider) => provider.isEnabled);

  const [state] = useActionState<ActionState, FormData>(
    signInWithProvider,
    {}
  );

  useEffect(() => {
    if (state.success) {
      router.push(redirect || "/dashboard");
      router.refresh(); // force to refresh the root layout
    }
  }, [state, redirect, router]);

  if (typeof auth === "boolean") {
    return null;
  }

  const providers = Object.keys(auth)
    .filter((key) => key !== "credentials")
    .filter((key) => auth[key as keyof typeof auth]);

  const handleProviderSignIn = async (provider: string) => {
    try {
      await signIn(provider, {
        callbackUrl: redirect || "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Error signing in with provider:", error);
    }
  };

  return (
    <>
      {providers.length > 0 && (
        <div className="relative my-6 flex items-center">
          <div className="w-full border-t border-gray-300" />
          <div className="relative flex justify-center text-sm px-2">
            <span className="px-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {t("OR_CONTINUE_WITH")}
            </span>
          </div>
          <div className="w-full border-t border-gray-300" />
        </div>
      )}

      <div className="flex justify-center items-center gap-5">
        {providerIcons.map((provider, index) => (
          <Button
            key={index}
            name="provider"
            value={provider.provider}
            type="button"
            isIconOnly
            className="hover:opacity-80 transition-opacity"
            onPress={() => handleProviderSignIn(provider.provider)}  >
            {provider.icons}
          </Button>
        ))}
      </div>
    </>
  );
}
