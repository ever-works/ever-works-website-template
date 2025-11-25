import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientProfileById, getLastLoginActivity } from "@/lib/db/queries";
import { getTranslations } from "next-intl/server";
import { ClientDetailContent } from "./client-detail-content";

type Params = { id: string; locale?: string };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const t = await getTranslations('admin.ADMIN_CLIENT_DETAIL_PAGE');

  const { id, locale: paramLocale } = await params;

  const session = await auth();
  if (!session?.user?.isAdmin) {
    const locale = paramLocale || "en";
    redirect(`/${locale}/auth/signin`);
  }

  const profile = await getClientProfileById(id);
  if (!profile) {
    notFound();
  }

  const lastLogin = await getLastLoginActivity(profile.id, 'client');
  const locale = paramLocale || "en";

  // Helper function to convert translation keys to actual strings
  const getTranslation = (key: string) => t(key);

  return <ClientDetailContent profile={profile} lastLogin={lastLogin} locale={locale} t={getTranslation} />;
}
