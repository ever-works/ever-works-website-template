import { redirect } from "next/navigation";

export const revalidate = 10;

/**
 * Simpler tag route - redirects to homepage with tag filter
 * /tags/[tag] → /?tags=[tag]
 */
export default async function TagListing({
  params,
}: {
  params: Promise<{ tag: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const { tag: rawTag, locale } = resolvedParams;
  const tag = decodeURI(rawTag);

  // Redirect to homepage with tag filter applied
  const localePrefix = locale ? `/${locale}` : '';
  redirect(`${localePrefix}/?tags=${encodeURIComponent(tag)}`);
}
