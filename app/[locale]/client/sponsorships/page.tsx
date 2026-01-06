import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SponsorshipsContent } from "./sponsorships-content";
import { getSponsorAdPricingConfig } from "@/lib/utils/settings";

export default async function SponsorshipsPage() {
	const session = await auth();

	// Check if user is authenticated
	if (!session?.user) {
		redirect('/auth/signin');
	}

	// Get current pricing configuration
	const pricingConfig = getSponsorAdPricingConfig();

	return <SponsorshipsContent pricingConfig={pricingConfig} />;
}
