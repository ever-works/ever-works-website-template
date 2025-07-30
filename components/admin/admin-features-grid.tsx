import { Users, FileText, BarChart3 } from "lucide-react";
import { AdminFeatureCard } from "./admin-feature-card";
import { AdminFeature } from "./types";

const ADMIN_FEATURES: AdminFeature[] = [
  {
    icon: Users,
    title: "Manage Users",
    description: "View and manage platform users and permissions.",
    href: "#",
    emoji: "👤"
  },
  {
    icon: FileText,
    title: "Review Submissions", 
    description: "Moderate and approve new directory items.",
    href: "#",
    emoji: "📝"
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "View platform statistics and reports.",
    href: "#",
    emoji: "📊"
  }
];

export function AdminFeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ADMIN_FEATURES.map((feature, index) => (
        <AdminFeatureCard key={`${feature.title}-${index}`} feature={feature} />
      ))}
    </div>
  );
} 