import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FiUser, FiMapPin, FiBriefcase, FiGlobe, FiSave, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default async function BasicInfoPage() {
  // Bypass auth for testing
  const session = { user: { name: "John Doe", email: "john@example.com" } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Container maxWidth="7xl" padding="default">
        <div className="space-y-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/settings/profile"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Settings
            </Link>
          </div>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-theme-primary-100 to-theme-primary-200 dark:from-theme-primary-900/40 dark:to-theme-primary-800/40 rounded-2xl mb-4">
              <FiUser className="w-8 h-8 text-theme-primary-600 dark:text-theme-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Basic Information
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Update your personal information and contact details. This information will be displayed on your public profile 
              and helps others discover and connect with you.
            </p>
          </div>

          {/* Form */}
          <Card className="border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-theme-primary-500" />
                Personal Information
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Tell us about yourself and how you&apos;d like to be represented
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="displayName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Display Name
                    </label>
                    <Input
                      id="displayName"
                      name="displayName"
                      defaultValue={session.user?.name || ""}
                      placeholder="Enter your display name"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This is how your name will appear to others
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </label>
                    <Input
                      id="username"
                      name="username"
                      defaultValue={session.user?.name?.toLowerCase().replace(/\s+/g, '') || ""}
                      placeholder="Enter your username"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your unique profile identifier
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full"
                    defaultValue="Full-stack developer passionate about creating amazing web experiences. I love working with React, TypeScript, and modern web technologies."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    A brief description about yourself and your work
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      Location
                    </label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="City, Country"
                      className="w-full"
                      defaultValue="San Francisco, CA"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Where you&apos;re based
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <FiBriefcase className="w-4 h-4" />
                      Company
                    </label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Your company name"
                      className="w-full"
                      defaultValue="Tech Corp"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your current employer or organization
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="jobTitle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Title
                    </label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      placeholder="Your job title"
                      className="w-full"
                      defaultValue="Senior Software Engineer"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your current role or position
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <FiGlobe className="w-4 h-4" />
                      Website
                    </label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      className="w-full"
                      defaultValue="https://johndoe.dev"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your personal website or portfolio
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/settings/profile"
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    Cancel
                  </Link>
                  <Button type="submit" className="inline-flex items-center gap-2">
                    <FiSave className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
} 