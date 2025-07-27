"use client";

import { AuthForm } from "@/app/[locale]/auth/components/auth-form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const params = useParams();
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (loginSuccess) {
      window.location.href = `/${params.locale}/admin`;
    }
  }, [loginSuccess, params.locale]);

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