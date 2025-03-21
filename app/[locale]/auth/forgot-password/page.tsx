"use client";

import { Mail, ArrowLeft } from "lucide-react";
import { useConfig } from "../../config";
import Link from "next/link";
import { useActionState } from "react";
import { Button, Input } from "@heroui/react";
import { ActionState } from "@/lib/auth/middleware";
import { forgotPassword } from "../actions";

export default function ForgotPasswordPage() {
  const config = useConfig();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    forgotPassword,
    {}
  );

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

              <h2 className="text-2xl font-bold mb-3">Forgot Your Password?</h2>

              <p className="text-gray-300 mb-6">
                {"Don't"} worry, it happens to the best of us. Enter your email
                address and {"we'll"} send you a link to reset your password.
              </p>

              {/* Icon with info */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded-full mr-3">
                    <Mail className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-300">
                    Check your inbox for the password reset email
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Forgot Password Form Side */}
          <div className="w-full md:w-1/2 p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Password Recovery</h3>
              <p className="text-sm text-gray-500">
                Enter the email address associated with your account
              </p>
            </div>

            {state.success ? (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
                  <p className="font-medium">Recovery email sent!</p>
                  <p className="text-sm mt-1">
                    Check your inbox at{" "}
                    <span className="font-medium">{state.email}</span> for
                    instructions to reset your password.
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{"Didn't"} receive the email?</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Check your spam folder</li>
                    <li>Make sure you entered the correct email</li>
                  </ul>
                </div>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                  />
                  {state.error && (
                    <div className="p-2 text-sm text-red-600 rounded">
                      {state.error}
                    </div>
                  )}
                </div>

                <Button type="submit" isLoading={pending} className="w-full">
                  Send Recovery Email
                </Button>

                <div className="text-center mt-4">
                  <Link
                    href="/auth/signin"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
