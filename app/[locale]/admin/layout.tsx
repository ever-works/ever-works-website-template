import { requireAdmin } from "@/lib/auth/guards";
import AdminLayoutClient from "./layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side admin check - redirects if not admin
  // Note: /admin/auth/* pages have their own layout and bypass this check
  await requireAdmin();

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
