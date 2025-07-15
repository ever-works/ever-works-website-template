"use client";

import { useState } from "react";
import { ProfileNavigation } from "./profile-navigation";
import { AboutSection } from "./sections/about-section";
import { PortfolioSection } from "./sections/portfolio-section";
import { SkillsSection } from "./sections/skills-section";
import { SubmissionsSection } from "./sections/submissions-section";

export interface Profile {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  location: string;
  company: string;
  jobTitle: string;
  website: string;
  socialLinks: Array<{
    platform: string;
    url: string;
    displayName: string;
  }>;
  skills: { name: string; level: number; }[];
  interests: string[];
  portfolio: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
    tags: string[];
    isFeatured: boolean;
  }>;
  themeColor: string;
  memberSince: string;
  submissions: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    status: "approved" | "pending" | "rejected";
    submittedAt: string;
    updatedAt: string;
    url: string;
    imageUrl?: string;
  }>;
}

interface ProfileContentProps {
  profile: Profile;
}

export function ProfileContent({ profile }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("about");

  const renderSection = () => {
    switch (activeTab) {
      case "about":
        return (
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              About
            </h2>
            <AboutSection profile={profile} />
          </section>
        );
      case "portfolio":
        return (
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              Portfolio
            </h2>
            <PortfolioSection profile={profile} />
          </section>
        );
      case "skills":
        return (
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              Skills & Expertise
            </h2>
            <SkillsSection profile={profile} />
          </section>
        );
      case "submissions":
        return (
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              Submissions
            </h2>
            <SubmissionsSection profile={profile} />
          </section>
        );
      default:
        return (
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              About
            </h2>
            <AboutSection profile={profile} />
          </section>
        );
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-2 sm:px-0">
      <ProfileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pt-2">{renderSection()}</div>
    </div>
  );
} 