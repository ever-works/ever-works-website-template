"use client";

import { AuthForm } from "@/app/[locale]/auth/components/auth-form";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const params = useParams();
  const router = useRouter();
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (loginSuccess) {
      router.push(`/${params.locale}/admin`);
    }
  }, [loginSuccess, params.locale, router]);

  return (
    <div>
      <AuthForm
        form="login"
        showSocialLogin={false}
        clientMode={true}
        onSuccess={() => setLoginSuccess(true)}
      />
    </div>
  );
} 