import { FiMapPin, FiBriefcase, FiGlobe, FiCalendar, FiTag } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Profile {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  location: string;
  company: string;
  jobTitle: string;
  website: string;
  skills: string[];
  interests: string[];
  memberSince: string;
}

interface AboutSectionProps {
  profile: Profile;
}

export function AboutSection({ profile }: AboutSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  return (
    <div className="space-y-6">
      {/* About Me */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            About Me
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            {profile.bio}
          </p>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.location && (
              <div className="flex items-center gap-3">
                <FiMapPin className="w-5 h-5 text-theme-primary-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-gray-900 dark:text-gray-100">{profile.location}</p>
                </div>
              </div>
            )}

            {profile.company && (
              <div className="flex items-center gap-3">
                <FiBriefcase className="w-5 h-5 text-theme-primary-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                  <p className="text-gray-900 dark:text-gray-100">{profile.company}</p>
                </div>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-3">
                <FiGlobe className="w-5 h-5 text-theme-primary-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary-600 dark:text-theme-primary-400 hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <FiCalendar className="w-5 h-5 text-theme-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="text-gray-900 dark:text-gray-100">{formatDate(profile.memberSince)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      {profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-theme-primary-100 dark:bg-theme-primary-900/30 text-theme-primary-800 dark:text-theme-primary-200 rounded-full text-sm font-medium"
                >
                  <FiTag className="w-3 h-3" />
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interests */}
      {profile.interests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                >
                  <FiTag className="w-3 h-3" />
                  {interest}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  );
} 