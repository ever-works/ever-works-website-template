import { AuthForm } from "@/app/[locale]/auth/components/auth-form";

export default function AdminLoginPage() {
  // TODO: Add logic to only allow isAdmin=true users
  return <AuthForm form="login" />;
} 