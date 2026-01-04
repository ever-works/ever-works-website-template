import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SponsorshipsContent } from "./sponsorships-content";

export default async function SponsorshipsPage() {
	const session = await auth();

	// Check if user is authenticated
	if (!session?.user) {
		redirect('/auth/signin');
	}

	return <SponsorshipsContent />;
}
