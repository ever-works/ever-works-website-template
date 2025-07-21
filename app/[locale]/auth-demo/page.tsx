import { AuthForm } from "../auth/components/auth-form";

export default function AuthDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-center text-2xl font-bold py-4">Login Demo</h1>
        <AuthForm form="login" />
      </div>
      <div>
        <h1 className="text-center text-2xl font-bold py-4">Signup Demo</h1>
        <AuthForm form="signup" />
      </div>
    </div>
  );
}
