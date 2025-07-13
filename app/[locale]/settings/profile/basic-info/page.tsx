import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          <Card className="border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg max-w-3xl mx-auto">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-theme-primary-500" />
                Personal Information
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Tell us about yourself and how you&apos;d like to be represented
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-8">
                {/* Name & Username */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="displayName" className="block font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      defaultValue={session.user?.name || ""}
                      placeholder="Enter your display name"
                      className="w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:theme-primary:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This is how your name will appear to others
                    </p>
                  </div>
                  <div className="space-y-4">
                    <label htmlFor="username" className="block font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      defaultValue={session.user?.name?.toLowerCase().replace(/\s+/g, '') || ""}
                      placeholder="Enter your username"
                      className="w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:theme-primary:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your unique profile identifier
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-4">
                  <label htmlFor="bio" className="block font-semibold text-gray-800 dark:text-gray-100 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-6 py-4 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:focus:border-theme-primary-400 hover:border-gray-300 dark:hover:border-gray-500 resize-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    defaultValue="Full-stack developer passionate about creating amazing web experiences. I love working with React, TypeScript, and modern web technologies."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    A brief description about yourself and your work
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* Location, Company, Job Title, Website */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="location" className="block font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      Location
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="City, Country"
                      className="w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:theme-primary:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      defaultValue="San Francisco, CA"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Where you&apos;re based
                    </p>
                  </div>
                  <div className="space-y-4">
                    <label htmlFor="company" className="block font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-1">
                      <FiBriefcase className="w-4 h-4" />
                      Company
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Your company name"
                      className="w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:theme-primary:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      defaultValue="Tech Corp"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your current employer or organization
                    </p>
                  </div>
                  <div className="space-y-4">
                    <label htmlFor="jobTitle" className="block font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      Job Title
                    </label>
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      placeholder="Your job title"
                      className="w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:theme-primary:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      defaultValue="Senior Software Engineer"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your current role or position
                    </p>
                  </div>
                  <div className="space-y-4">
                    <label htmlFor="website" className="block font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-1">
                      <FiGlobe className="w-4 h-4" />
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      className="w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:theme-primary:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      defaultValue="https://johndoe.dev"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your personal website or portfolio
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col md:flex-row justify-end gap-4 mt-4">
                    <Link
                      href="/settings/profile"
                      className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-center md:text-left"
                    >
                      Cancel
                    </Link>
                    <Button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2 text-base font-semibold bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-md transition-colors shadow-md w-full md:w-auto justify-center"
                    >
                      <FiSave className="w-5 h-5" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
} 