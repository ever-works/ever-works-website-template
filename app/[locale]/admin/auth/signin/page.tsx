"use client";

import { AuthForm } from "@/app/[locale]/auth/components/auth-form";
import { useParams, useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const params = useParams();
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push(`/${params.locale}/admin`);
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