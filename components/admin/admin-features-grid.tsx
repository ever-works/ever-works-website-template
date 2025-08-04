import { Users, FileText, BarChart3, FolderTree, Tag, Package } from "lucide-react";
import { AdminFeatureCard } from "./admin-feature-card";
import { AdminFeature } from "./types";

const ADMIN_FEATURES: AdminFeature[] = [
  {
    icon: FolderTree,
    title: "Manage Categories",
    description: "Create, edit, and organize content categories.",
    href: "/admin/categories",
    emoji: "📁"
  },
  {
    icon: Tag,
    title: "Manage Tags",
    description: "Create, edit, and organize content tags.",
    href: "/admin/tags",
    emoji: "🏷️"
  },
  {
    icon: Package,
    title: "Manage Items",
    description: "Create, edit, review, and approve content items.",
    href: "/admin/items",
    emoji: "📦"
  },
  {
    icon: Users,
    title: "Manage Clients",
    description: "View and manage client accounts and information.",
    href: "/admin/clients",
    emoji: "👥"
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