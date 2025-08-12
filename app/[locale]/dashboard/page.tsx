import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect old dashboard route to new client dashboard
  redirect('/client/dashboard');
}
