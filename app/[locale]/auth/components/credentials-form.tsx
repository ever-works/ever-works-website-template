"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signInAction, signUp } from "../actions";
import { ActionState } from "@/lib/auth/middleware";
import { PropsWithChildren, useActionState, useEffect } from "react";
import { User, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { Button, cn } from "@heroui/react";
import { useConfig } from "../../config";
import { useTranslations } from "next-intl";

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

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isLogin ? signInAction : signUp,
    {}
  );

  useEffect(() => {
    if (state.success) {
      router.push(redirect || "/dashboard");
      router.refresh(); // force to refresh the root layout
    }
  }, [state, redirect, router]);

  const form = (
    <form className="space-y-4" action={formAction}>
      {!isLogin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {t("FULL_NAME")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>

            <input
              type="text"
              className="pl-10 w-full px-4 py-2 border-gray-300 rounded-lg border-2 focus:border-blue-500"
              placeholder={t("ENTER_YOUR_FULL_NAME")}
              name="name"
              defaultValue={state?.name}
              required
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {t("EMAIL_ADDRESS")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            className="pl-10 w-full px-4 py-2 border-gray-300 rounded-lg border-2 focus:border-blue-500"
            placeholder={t("ENTER_YOUR_EMAIL")}
            name="email"
            defaultValue={state?.email}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {t("PASSWORD")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            className="pl-10 w-full px-4 py-2 border-gray-300 rounded-lg border-2 focus:border-blue-500"
            placeholder={t("ENTER_YOUR_PASSWORD")}
            name="password"
            defaultValue={state?.password}
            required
          />
        </div>
      </div>

      {state?.error && (
        <div className="text-red-500 text-sm">{state?.error}</div>
      )}

      {isLogin && (
        <div className="flex items-center justify-between my-2">
          <div className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t("FORGOT_PASSWORD")}
            </Link>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className={cn(
          "w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none",
          "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        )}
        isLoading={pending || !!state.success}
      >
        {!pending && (isLogin ? t("SIGN_IN") : t("CREATE_ACCOUNT"))}
      </Button>
    </form>
  );

  return (
    <>
      <div className="mb-6 text-center">
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

      {auth.credentials ? form : null}

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
