import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sponsorAdService } from "@/lib/services/sponsor-ad.service";

/**
 * @swagger
 * /api/sponsor-ads/user/{id}/cancel:
 *   post:
 *     tags: ["Sponsor Ads - User"]
 *     summary: "Cancel user's sponsor ad"
 *     description: "Cancels a sponsor ad owned by the authenticated user. Can only cancel pending, approved, or active ads."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *         description: "Sponsor ad ID to cancel"
 *     responses:
 *       200:
 *         description: "Sponsor ad cancelled successfully"
 *       400:
 *         description: "Bad request - Cannot cancel ad with current status"
 *       401:
 *         description: "Unauthorized"
 *       403:
 *         description: "Forbidden - User does not own this sponsor ad"
 *       404:
 *         description: "Sponsor ad not found"
 *       500:
 *         description: "Internal server error"
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id } = await params;

		// Get the sponsor ad to verify ownership
		const sponsorAd = await sponsorAdService.getSponsorAdById(id);

		if (!sponsorAd) {
			return NextResponse.json(
				{ success: false, error: "Sponsor ad not found" },
				{ status: 404 }
			);
		}

		// Verify ownership
		if (sponsorAd.userId !== session.user.id) {
			return NextResponse.json(
				{ success: false, error: "You do not have permission to cancel this sponsor ad" },
				{ status: 403 }
			);
		}

		// Cancel the sponsor ad
		const cancelledAd = await sponsorAdService.cancelSponsorAd(
			id,
			"Cancelled by user"
		);

		if (!cancelledAd) {
			return NextResponse.json(
				{ success: false, error: "Failed to cancel sponsor ad" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: cancelledAd,
			message: "Sponsor ad cancelled successfully",
		});
	} catch (error) {
		console.error("Error cancelling sponsor ad:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Failed to cancel sponsor ad";

		if (errorMessage.includes("Cannot cancel")) {
			return NextResponse.json(
				{ success: false, error: errorMessage },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}
