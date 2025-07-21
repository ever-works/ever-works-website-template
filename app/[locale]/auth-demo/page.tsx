import { AuthForm } from "../auth/components/auth-form";

export default function AuthDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-center text-3xl font-bold py-8 text-gray-900 dark:text-white">
            Authentication Demo
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Preview of the login and signup interfaces
          </p>
        </div>

        <div className="space-y-16">
          <div>
            <h2 className="text-center text-xl font-semibold mb-8 text-gray-800 dark:text-gray-200">
              Login Interface
            </h2>
            <AuthForm form="login" />
          </div>

          <div>
            <h2 className="text-center text-xl font-semibold mb-8 text-gray-800 dark:text-gray-200">
              Signup Interface
            </h2>
            <AuthForm form="signup" />
          </div>
        </div>
      </div>
    </div>
  );
}
