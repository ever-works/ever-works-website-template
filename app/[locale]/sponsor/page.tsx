import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCachedItems } from "@/lib/content";
import { SponsorForm } from "@/components/sponsor-ads";
import { Megaphone, CheckCircle, Globe, TrendingUp } from "lucide-react";

export default async function SponsorPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const session = await auth();
	const t = await getTranslations("sponsor");

	// Check if user is authenticated
	if (!session?.user?.id) {
		redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/sponsor`);
	}

	// Get all items and filter by user's submitted items
	const { items: allItems } = await getCachedItems({ lang: locale });

	// Filter items submitted by this user
	// Items have a submitted_by field that matches the user ID
	const userItems = allItems.filter(
		(item) => (item as { submitted_by?: string }).submitted_by === session.user.id
	);

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8 text-center">
				<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
					<Megaphone className="h-8 w-8 text-primary" />
				</div>
				<h1 className="text-3xl font-bold">{t("PAGE_TITLE")}</h1>
				<p className="mt-2 text-muted-foreground">{t("PAGE_DESCRIPTION")}</p>
			</div>

			{/* Benefits */}
			<div className="mb-8 grid gap-4 sm:grid-cols-3">
				<div className="flex items-start gap-3 rounded-lg border p-4">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
						<Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
					<div>
						<h3 className="font-medium">{t("BENEFIT_VISIBILITY_TITLE")}</h3>
						<p className="text-sm text-muted-foreground">
							{t("BENEFIT_VISIBILITY_DESCRIPTION")}
						</p>
					</div>
				</div>
				<div className="flex items-start gap-3 rounded-lg border p-4">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
						<TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<h3 className="font-medium">{t("BENEFIT_TRAFFIC_TITLE")}</h3>
						<p className="text-sm text-muted-foreground">
							{t("BENEFIT_TRAFFIC_DESCRIPTION")}
						</p>
					</div>
				</div>
				<div className="flex items-start gap-3 rounded-lg border p-4">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
						<CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
					</div>
					<div>
						<h3 className="font-medium">{t("BENEFIT_BADGE_TITLE")}</h3>
						<p className="text-sm text-muted-foreground">
							{t("BENEFIT_BADGE_DESCRIPTION")}
						</p>
					</div>
				</div>
			</div>

			{/* Form or Empty State */}
			{userItems.length > 0 ? (
				<div className="mx-auto max-w-2xl">
					<SponsorForm items={userItems} locale={locale} />
				</div>
			) : (
				<div className="mx-auto max-w-md text-center">
					<div className="rounded-lg border border-dashed p-8">
						<Megaphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<h2 className="mb-2 text-lg font-medium">{t("NO_ITEMS_TITLE")}</h2>
						<p className="mb-4 text-sm text-muted-foreground">
							{t("NO_ITEMS_DESCRIPTION")}
						</p>
						<a
							href={`/${locale}/submit`}
							className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
						>
							{t("SUBMIT_ITEM_CTA")}
						</a>
					</div>
				</div>
			)}
		</div>
	);
}
