"use client";

import { AuthForm } from "@/app/[locale]/auth/components/auth-form";

export default function AdminLoginPage() {
  // TODO: Implement logic to check isAdmin after login
  // For now, just render the form and show error if set
  return (
    <div>
      <AuthForm form="login" />
    </div>
  );
} 