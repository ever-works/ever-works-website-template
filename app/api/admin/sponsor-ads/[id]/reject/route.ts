import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sponsorAdService } from "@/lib/services/sponsor-ad.service";
import { rejectSponsorAdSchema } from "@/lib/validations/sponsor-ad";

/**
 * @swagger
 * /api/admin/sponsor-ads/{id}/reject:
 *   post:
 *     tags: ["Admin - Sponsor Ads"]
 *     summary: "Reject sponsor ad"
 *     description: "Rejects a pending sponsor ad submission with a reason. Only pending ads can be rejected. Requires admin authentication."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *         description: "Sponsor ad ID to reject"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: "Reason for rejection (minimum 10 characters)"
 *             required:
 *               - rejectionReason
 *     responses:
 *       200:
 *         description: "Sponsor ad rejected successfully"
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
 *                   example: "Sponsor ad rejected successfully"
 *       400:
 *         description: "Bad request - Invalid input or cannot reject ad with current status"
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
		const body = await request.json();

		// Validate request body
		const validationResult = rejectSponsorAdSchema.safeParse({
			id,
			rejectionReason: body.rejectionReason,
		});

		if (!validationResult.success) {
			return NextResponse.json(
				{
					success: false,
					error:
						validationResult.error.errors[0]?.message ||
						"Invalid request body",
				},
				{ status: 400 }
			);
		}

		const sponsorAd = await sponsorAdService.rejectSponsorAd(
			id,
			session.user.id,
			validationResult.data.rejectionReason
		);

		if (!sponsorAd) {
			return NextResponse.json(
				{ success: false, error: "Failed to reject sponsor ad" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: sponsorAd,
			message: "Sponsor ad rejected successfully",
		});
	} catch (error) {
		console.error("Error rejecting sponsor ad:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Failed to reject sponsor ad";

		if (errorMessage === "Sponsor ad not found") {
			return NextResponse.json(
				{ success: false, error: errorMessage },
				{ status: 404 }
			);
		}

		if (errorMessage.includes("Cannot reject")) {
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
