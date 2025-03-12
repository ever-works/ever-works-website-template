"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Search, User, Lock, Mail, Building } from "lucide-react";
import { Button, cn } from "@heroui/react";

export function AuthPage({ form }: { form: "login" | "signup" }) {
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
              <div className="flex items-center mb-6">
                <MapPin className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-2xl font-bold">DirectoryHub</span>
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
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {isLogin ? "Sign In" : "Create Account"}
              </h1>
              <p className="text-gray-500 dark:text-gray-100 text-sm">
                {isLogin
                  ? "Enter your credentials to access your account"
                  : "Fill in the form to join our directory"}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="pl-10 w-full px-4 py-2 border-gray-300 rounded-lg border-2 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="pl-10 w-full px-4 py-2 border-gray-300 rounded-lg border-2 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="pl-10 w-full px-4 py-2 border-gray-300 rounded-lg border-2 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      className="pl-10 w-full px-4 py-2 border-gray-300 rounded-lg border-2 focus:border-blue-500"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
                    >
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link
                      href="#"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={cn(
                  "w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none",
                  "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                )}
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Social login buttons */}
                <button
                  type="button"
                  className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="text-center mt-6">
              <Button
                as={Link}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                href={isLogin ? "/auth/register" : "/auth/login"}
                variant="flat"
              >
                {isLogin
                  ? "Need an account? Sign up"
                  : "Already have an account? Sign in"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
