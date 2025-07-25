"use client";

import { AuthForm } from "@/app/[locale]/auth/components/auth-form";

export default function AdminLoginPage() {
  return (
    <div>
      <AuthForm form="login" showSocialLogin={false} />
    </div>
  );
} 