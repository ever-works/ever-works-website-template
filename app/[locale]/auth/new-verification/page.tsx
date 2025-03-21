"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, MailCheck, Loader2 } from "lucide-react";
import { useConfig } from "../../config";
import { Button } from "@heroui/react";
import { verifyEmailAction } from "../actions";
import { Link } from "@/i18n/navigation";

export default function EmailVerificationPage() {
  const config = useConfig();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verificationState, setVerificationState] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationState("error");
        setError("Missing verification token");
        return;
      }

      try {
        const result = await verifyEmailAction(token);
        if (result.success) {
          setVerificationState("success");
        } else if (result.error) {
          setVerificationState("error");
          setError(result.error);
        }
      } catch (error) {
        console.error(error);

        setVerificationState("error");
        setError("An error occurred during verification");
      }
    };

    verifyEmail();
  }, [token]);

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

              <h2 className="text-2xl font-bold mb-3">Email Verification</h2>

              <p className="text-gray-300 mb-6">
                Verifying your email helps us secure your account and keep you
                informed about important updates.
              </p>

              {/* Directory Feature */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded-full mr-3">
                    <MailCheck className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-300">
                    Get access to all features once verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status Side */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <div className="text-center space-y-6">
              {verificationState === "loading" && (
                <>
                  <div className="flex justify-center">
                    <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Verifying Your Email
                    </h3>
                    <p className="text-gray-500">
                      Please wait while we verify your email address...
                    </p>
                  </div>
                </>
              )}

              {verificationState === "success" && (
                <>
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Email Verified!
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Your email has been successfully verified. You now have
                      full access to all features.
                    </p>
                    <Link href="/auth/signin">
                      <Button className="w-full">Continue to Login</Button>
                    </Link>
                  </div>
                </>
              )}

              {verificationState === "error" && (
                <>
                  <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Verification Failed
                    </h3>

                    <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm mb-6">
                      {error || "There was a problem verifying your email."}
                    </div>
                    <Link href="/auth/signin">
                      <Button variant="bordered" className="w-full mb-3">
                        Return to Login
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
