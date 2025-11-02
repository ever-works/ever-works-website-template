import { Search, Building, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AuthFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Shared authentication features displayed on both login page and modal
 * Single source of truth for consistent messaging
 */
export const authFeatures: AuthFeature[] = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Advanced filters for precise results"
  },
  {
    icon: Building,
    title: "Business Growth",
    description: "Reach your target audience effectively"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade data protection"
  }
];
