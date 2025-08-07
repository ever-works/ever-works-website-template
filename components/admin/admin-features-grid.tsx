import { Users, FileText, BarChart3, FolderTree, Tag, Package, Shield } from "lucide-react";
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
    icon: Shield,
    title: "Manage Roles",
    description: "Create, edit, and manage user roles and permissions.",
    href: "/admin/roles",
    emoji: "🛡️"
  },
  {
    icon: Users,
    title: "Manage Users",
    description: "View and manage platform users and permissions.",
    href: "/admin/users",
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