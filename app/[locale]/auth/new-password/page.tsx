"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { KeyRound, Shield, Eye, EyeOff, XCircle } from "lucide-react";
import { useConfig } from "../../config";
import { Button, cn, Input, Progress } from "@heroui/react";
import { Link } from "@/i18n/navigation";
import { newPasswordAction, verifyPasswordTokenAction } from "../actions";

export default function NewPasswordPage() {
  const config = useConfig();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Password strength criteria
  const passwordCriteria = useMemo(() => {
    return [
      {
        id: "length",
        label: "At least 8 characters",
        test: (pwd: string) => pwd.length >= 8,
      },
      {
        id: "lowercase",
        label: "Lowercase letter",
        test: (pwd: string) => /[a-z]/.test(pwd),
      },
      {
        id: "uppercase",
        label: "Uppercase letter",
        test: (pwd: string) => /[A-Z]/.test(pwd),
      },
      { id: "number", label: "Number", test: (pwd: string) => /\d/.test(pwd) },
      {
        id: "special",
        label: "Special character",
        test: (pwd: string) => /[!@#$%^&*~(){}[\]|;:'",<>.?]/.test(pwd),
      },
    ];
  }, []);

  useEffect(() => {
    if (password) {
      const meetsCount = passwordCriteria.filter((c) =>
        c.test(password)
      ).length;
      setPasswordStrength((meetsCount / passwordCriteria.length) * 100);
    } else {
      setPasswordStrength(0);
    }
  }, [password, passwordCriteria]);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Missing reset token");
        setIsTokenValid(false);
        setIsLoading(false);
        return;
      }

      try {
        const result = await verifyPasswordTokenAction(token);
        if (result.success) {
          setIsTokenValid(true);
        } else if (result.error) {
          setError(result.error);
          setIsTokenValid(false);
        }

        setIsLoading(false);
      } catch (error) {
        console.error(error);

        setIsTokenValid(false);
        setIsLoading(false);
        setError("An error occurred while verifying the reset token");
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (token) {
      formData.append("token", token);
    }

    if (passwordStrength < 60) {
      setError("Please choose a stronger password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await newPasswordAction({}, formData);
      if (result.success) {
        setSuccess(true);
      } else if ("error" in result && result.error) {
        setSuccess(false);
        setError(result.error);
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError("Failed to set new password. Please try again.");
      setIsLoading(false);
    }
  };

  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 60) return "bg-yellow-500";
    if (passwordStrength < 80) return "bg-blue-500";
    return "bg-green-500";
  };

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

              <h2 className="text-2xl font-bold mb-3">Create New Password</h2>

              <p className="text-gray-300 mb-6">
                Create a strong, unique password to protect your account and
                personal information.
              </p>

              {/* Directory Feature */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded-full mr-3">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-300">
                    Secure your account with a strong password
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded-full mr-3">
                    <KeyRound className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-300">
                    Never reuse passwords across different sites
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* New Password Form Side */}
          <div className="w-full md:w-1/2 p-8">
            {isLoading && !success ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">Processing...</p>
              </div>
            ) : !isTokenValid && !success ? (
              <div className="space-y-3 text-center flex flex-col">
                <div className="flex justify-center">
                  <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Verification Failed
                </h3>

                <div className="p-3 bg-red-50 text-red-700 rounded-md">
                  <p>
                    {error ||
                      "This password reset link has expired or is invalid."}
                  </p>
                </div>

                <Link href="/auth/forgot-password">
                  <Button className="w-full">Request New Reset Link</Button>
                </Link>

                <div className="text-center mt-4">
                  <Link
                    href="/auth/signin"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : success ? (
              <div className="space-y-6 text-center">
                <div className="p-6 flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Password Updated!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Your password has been successfully updated. You can now log
                    in with your new password.
                  </p>
                </div>

                <Link href="/auth/signin">
                  <Button className="w-full">Go to Login</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Set New Password
                  </h3>
                  <p className="text-sm text-gray-500">
                    Create a strong password that you {"don't"} use for other
                    websites
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="pr-10"
                          name="newPassword"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Password strength meter */}
                      {password && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Password strength</span>
                            <span
                              className={
                                passwordStrength >= 80
                                  ? "text-green-500"
                                  : passwordStrength >= 60
                                  ? "text-blue-500"
                                  : passwordStrength >= 40
                                  ? "text-yellow-500"
                                  : "text-red-500"
                              }
                            >
                              {passwordStrength >= 80
                                ? "Strong"
                                : passwordStrength >= 60
                                ? "Good"
                                : passwordStrength >= 40
                                ? "Fair"
                                : "Weak"}
                            </span>
                          </div>
                          <Progress
                            value={passwordStrength}
                            className={cn("h-1", getStrengthColor())}
                          />

                          {/* Password criteria checklist */}
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                            {passwordCriteria.map((criterion) => (
                              <div
                                key={criterion.id}
                                className="flex items-center"
                              >
                                <div
                                  className={cn(
                                    `w-3 h-3 rounded-full mr-2`,
                                    criterion.test(password)
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  )}
                                />
                                <span
                                  className={cn(
                                    criterion.test(password) && "text-gray-500"
                                  )}
                                >
                                  {criterion.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Confirm Password
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        name="confirmPassword"
                        required
                      />
                    </div>

                    {error && (
                      <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
                        {error}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    {"Set New Password"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
