import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sponsorAdService } from "@/lib/services/sponsor-ad.service";

/**
 * @swagger
 * /api/admin/sponsor-ads/{id}/approve:
 *   post:
 *     tags: ["Admin - Sponsor Ads"]
 *     summary: "Approve sponsor ad"
 *     description: "Approves a pending sponsor ad submission. Only pending ads can be approved. Requires admin authentication."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *         description: "Sponsor ad ID to approve"
 *     responses:
 *       200:
 *         description: "Sponsor ad approved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: "Sponsor ad approved successfully"
 *       400:
 *         description: "Bad request - Cannot approve ad with current status"
 *       401:
 *         description: "Unauthorized"
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

		const sponsorAd = await sponsorAdService.approveSponsorAd(
			id,
			session.user.id
		);

		if (!sponsorAd) {
			return NextResponse.json(
				{ success: false, error: "Failed to approve sponsor ad" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: sponsorAd,
			message: "Sponsor ad approved successfully",
		});
	} catch (error) {
		console.error("Error approving sponsor ad:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Failed to approve sponsor ad";

		if (errorMessage === "Sponsor ad not found") {
			return NextResponse.json(
				{ success: false, error: errorMessage },
				{ status: 404 }
			);
		}

		if (errorMessage.includes("Cannot approve")) {
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
