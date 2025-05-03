"use client";

import { CheckCircle } from "lucide-react";
import { Session } from "next-auth";

type Props = {
  session: Session | null;
};

export const DashboardContent = ({ session }: Props) => {
  const user = session?.user;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome Card */}
          <div className="px-4 py-6 sm:px-0 border rounded-lg border-gray-200">
            <div className="overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                      Welcome back, {user?.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-100">
                      You have successfully logged in to your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 dark:border-gray-500 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Ready to get started
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-100">
                  This is where your application content will go.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
