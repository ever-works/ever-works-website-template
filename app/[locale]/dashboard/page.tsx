import { DashboardContent } from "./content";

export default function DashboardPage() {
  // No auth required - pass null session
  return <DashboardContent session={null} />;
}
