"use client";

import { AuthForm } from "@/app/[locale]/auth/components/auth-form";
import { useParams } from "next/navigation";

export default function AdminLoginPage() {
  const params = useParams();
  // const router = useRouter(); // Removed - using window.location.href instead

  const handleLoginSuccess = () => {
    console.log('DEBUG: Admin login success, redirecting to:', `/${params.locale}/admin`);
    // Force a page reload to ensure session is properly loaded in middleware
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