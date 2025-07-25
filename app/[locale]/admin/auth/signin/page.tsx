"use client";

import { AuthForm } from "@/app/[locale]/auth/components/auth-form";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (loginSuccess) {
      router.push(`/${params.locale}/admin/dashboard`);
    }
  }, [loginSuccess, params.locale, router]);

  return (
    <div>
      <AuthForm form="login" showSocialLogin={false} onSuccess={() => setLoginSuccess(true)} />
    </div>
  );
} 