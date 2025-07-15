import { FiAward, FiTrendingUp } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileTag } from "../profile-tag";

interface Profile {
  skills: string[];
}

interface SkillsSectionProps {
  profile: Profile;
}

export function SkillsSection({ profile }: SkillsSectionProps) {
  // Dummy skill levels for demonstration
  const skillLevels = {
    "React": 90,
    "TypeScript": 85,
    "Node.js": 80,
    "Next.js": 85,
    "Tailwind CSS": 90,
  };

  const getSkillLevel = (skill: string) => {
    return skillLevels[skill as keyof typeof skillLevels] || 70;
  };

  const getSkillCategory = (skill: string) => {
    const frontend = ["React", "Vue.js", "Angular", "HTML", "CSS", "JavaScript", "TypeScript"];
    const backend = ["Node.js", "Python", "Java", "C#", "PHP", "Go", "Rust"];
    const tools = ["Next.js", "Tailwind CSS", "Docker", "Git", "AWS", "Firebase"];
    
    if (frontend.includes(skill)) return "Frontend";
    if (backend.includes(skill)) return "Backend";
    if (tools.includes(skill)) return "Tools & Frameworks";
    return "Other";
  };

  const categorizedSkills = profile.skills.reduce((acc, skill) => {
    const category = getSkillCategory(skill);
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-8">
      {/* Skills Tag Summary */}
      <Card className="border border-gray-600/40 dark:border-gray-300/10 rounded-xl bg-transparent shadow p-6">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <FiAward className="w-5 h-5 text-theme-primary-500" />
            Skills & Expertise
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-wrap gap-2 mb-6">
            {profile.skills.map((skill) => (
              <ProfileTag key={skill} label={skill} />
            ))}
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Here are the technologies and tools I work with. Each skill represents my proficiency level based on experience and projects.
          </p>
          
          <div className="space-y-6">
            {Object.entries(categorizedSkills).map(([category, skills]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-theme-primary-500" />
                  {category}
                </h3>
                
                <div className="space-y-3">
                  {skills.map((skill) => {
                    const level = getSkillLevel(skill);
                    return (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {skill}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {level}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-theme-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${level}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Summary */}
      <Card className="border border-gray-600/40 dark:border-gray-300/10 rounded-xl bg-transparent shadow p-6">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-lg font-bold text-gray-100">Skills Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-theme-primary-50 dark:bg-theme-primary-900/20 rounded-lg">
              <div className="text-2xl font-bold text-theme-primary-600 dark:text-theme-primary-400">
                {profile.skills.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Skills</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Object.keys(categorizedSkills).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {profile.skills && profile.skills.length > 0
                  ? Math.round(profile.skills.reduce((sum, skill) => sum + getSkillLevel(skill), 0) / profile.skills.length)
                  : 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Proficiency</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 