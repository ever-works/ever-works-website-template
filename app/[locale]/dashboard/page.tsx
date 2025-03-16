import { auth } from "@/lib/auth";
import { DashboardContent } from "./content";

export default async function DashboardPage() {
  const session = await auth();

  return <DashboardContent session={session} />;
}
