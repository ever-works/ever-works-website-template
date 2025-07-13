"use client";

import { useState } from "react";
import { ProfileNavigation } from "./profile-navigation";
import { AboutSection } from "./sections/about-section";
import { PortfolioSection } from "./sections/portfolio-section";
import { SkillsSection } from "./sections/skills-section";

interface Profile {
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
  skills: string[];
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
}

interface ProfileContentProps {
  profile: Profile;
}

export function ProfileContent({ profile }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("about");

  const renderSection = () => {
    switch (activeTab) {
      case "about":
        return <AboutSection profile={profile} />;
      case "portfolio":
        return <PortfolioSection profile={profile} />;
      case "skills":
        return <SkillsSection profile={profile} />;
      default:
        return <AboutSection profile={profile} />;
    }
  };

  return (
    <div className="space-y-8">
      <ProfileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderSection()}
    </div>
  );
} 