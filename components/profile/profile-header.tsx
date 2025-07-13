import Image from "next/image";
import { FiEdit2, FiMapPin, FiBriefcase, FiGlobe, FiGithub, FiLinkedin, FiTwitter } from "react-icons/fi";
import { Card } from "@/components/ui/card";

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
  themeColor: string;
}

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile?: boolean;
}

export function ProfileHeader({ profile, isOwnProfile = false }: ProfileHeaderProps) {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <FiGithub className="w-5 h-5" />;
      case "linkedin":
        return <FiLinkedin className="w-5 h-5" />;
      case "twitter":
        return <FiTwitter className="w-5 h-5" />;
      default:
        return <FiGlobe className="w-5 h-5" />;
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg">
      {/* Background with theme color */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 opacity-10"
        style={{ 
          background: `linear-gradient(135deg, ${profile.themeColor}20, ${profile.themeColor}40)` 
        }}
      />
      
      <div className="relative p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-lg">
              <Image
                src={profile.avatar}
                alt={`${profile.displayName}'s avatar`}
                width={128}
                height={128}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            {isOwnProfile && (
              <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FiEdit2 className="w-4 h-4 text-theme-primary-600 dark:text-theme-primary-400" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="space-y-4">
              {/* Name and Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {profile.displayName}
                </h1>
                <p className="text-lg text-theme-primary-600 dark:text-theme-primary-400 font-medium">
                  {profile.jobTitle}
                </p>
              </div>

              {/* Bio */}
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl">
                {profile.bio}
              </p>

              {/* Location and Company */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-2">
                    <FiBriefcase className="w-4 h-4" />
                    <span>{profile.company}</span>
                  </div>
                )}
                {profile.website && (
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-theme-primary-600 dark:hover:text-theme-primary-400 transition-colors"
                  >
                    <FiGlobe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {/* Social Links */}
              {profile.socialLinks.length > 0 && (
                <div className="flex items-center gap-4 pt-2">
                  {profile.socialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {getSocialIcon(link.platform)}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {link.displayName}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 