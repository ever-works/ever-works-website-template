"use client";

import { Search, User, Building } from "lucide-react";
import { useConfig } from "../../config";
import { CredentialsForm } from "./credentials-form";
import { SocialLogin } from "./social-login";

export function AuthForm({ form }: { form: "login" | "signup" }) {
  const config = useConfig();

  const isLogin = form === "login";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Main container */}
      <div className="w-full max-w-4xl rounded-lg border dark:border-gray-800 shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Brand/Directory Info Side */}
          <div className="w-full md:w-1/2 bg-gray-800 text-white p-8 flex flex-col justify-center">
            <div className="mb-6">
              {/* Directory Logo */}
              <div className="flex items-center mb-6 space-x-2">
                <span className="text-2xl font-bold">
                  {config.company_name}
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-3">
                {isLogin ? "Welcome Back" : "Join Our Directory"}
              </h2>

              <p className="text-gray-300 mb-6">
                {isLogin
                  ? "Access thousands of listings and find exactly what you're looking for."
                  : "Create an account to list your business or explore our extensive directory."}
              </p>

              {/* Directory Feature List */}
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded-full mr-3">
                    <Search className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-300">
                    Search thousands of listings
                  </span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded-full mr-3">
                    <Building className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-300">
                    List your business or service
                  </span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded-full mr-3">
                    <User className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-300">
                    Connect with professionals
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Auth Form Side */}
          <div className="w-full md:w-1/2 p-8">
            <CredentialsForm type={form}>
              <SocialLogin />
            </CredentialsForm>
          </div>
        </div>
      </div>
    </div>
  );
}
