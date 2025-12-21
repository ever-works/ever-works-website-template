import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sponsorAdService } from "@/lib/services/sponsor-ad.service";

/**
 * @swagger
 * /api/admin/sponsor-ads/{id}:
 *   get:
 *     tags: ["Admin - Sponsor Ads"]
 *     summary: "Get sponsor ad by ID"
 *     description: "Retrieves a specific sponsor ad with user details. Requires admin authentication."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Sponsor ad retrieved successfully"
 *       401:
 *         description: "Unauthorized"
 *       404:
 *         description: "Sponsor ad not found"
 *       500:
 *         description: "Internal server error"
 */
export async function GET(
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

		if (!session.user.isAdmin) {
			return NextResponse.json(
				{ success: false, error: "Forbidden" },
				{ status: 403 }
			);
		}

		const { id } = await params;
		const sponsorAd = await sponsorAdService.getSponsorAdWithUser(id);

		if (!sponsorAd) {
			return NextResponse.json(
				{ success: false, error: "Sponsor ad not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: sponsorAd,
		});
	} catch (error) {
		console.error("Error fetching sponsor ad:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch sponsor ad" },
			{ status: 500 }
		);
	}
}

/**
 * @swagger
 * /api/admin/sponsor-ads/{id}:
 *   delete:
 *     tags: ["Admin - Sponsor Ads"]
 *     summary: "Delete sponsor ad"
 *     description: "Permanently deletes a sponsor ad. Requires admin authentication."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Sponsor ad deleted successfully"
 *       401:
 *         description: "Unauthorized"
 *       404:
 *         description: "Sponsor ad not found"
 *       500:
 *         description: "Internal server error"
 */
export async function DELETE(
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

		if (!session.user.isAdmin) {
			return NextResponse.json(
				{ success: false, error: "Forbidden" },
				{ status: 403 }
			);
		}

		const { id } = await params;

		await sponsorAdService.deleteSponsorAd(id);

		return NextResponse.json({
			success: true,
			message: "Sponsor ad deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting sponsor ad:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete sponsor ad";

		if (errorMessage === "Sponsor ad not found") {
			return NextResponse.json(
				{ success: false, error: errorMessage },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}
