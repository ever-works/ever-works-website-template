"use client";

import { AuthForm } from "@/app/[locale]/auth/components/auth-form";
import { useParams } from "next/navigation";

export default function AdminLoginPage() {
  const params = useParams();

  const handleLoginSuccess = () => {
    window.location.href = `/${params.locale}/admin`;
  };

  return (
    <div>
      <AuthForm
        form="login"
        showSocialLogin={false}
        clientMode={true}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
} 