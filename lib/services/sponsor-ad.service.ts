/**
 * Sponsor Ad Service
 * Handles all sponsor ad-related business logic
 */

import * as sponsorAdRepo from "@/lib/repositories/sponsor-ad.repository";
import {
	SponsorAdStatus,
	SponsorAdInterval,
	type SponsorAd,
	type NewSponsorAd,
} from "@/lib/db/schema";
import { SponsorAdPricing } from "@/lib/constants";
import type {
	SponsorAdListOptions,
	SponsorAdStats,
	SponsorAdWithUser,
	CreateSponsorAdRequest,
} from "@/lib/types/sponsor-ad";

// ######################### Service Class #########################

export class SponsorAdService {
	// ===================== Read Operations =====================

	/**
	 * Get sponsor ad by ID
	 */
	async getSponsorAdById(id: string): Promise<SponsorAd | null> {
		return await sponsorAdRepo.getSponsorAdById(id);
	}

	/**
	 * Get sponsor ad with user details
	 */
	async getSponsorAdWithUser(id: string): Promise<SponsorAdWithUser | null> {
		return await sponsorAdRepo.getSponsorAdWithUser(id);
	}

	/**
	 * Get all sponsor ads for a user
	 */
	async getSponsorAdsByUserId(userId: string): Promise<SponsorAd[]> {
		return await sponsorAdRepo.getSponsorAdsByUserId(userId);
	}

	/**
	 * Get active sponsor ads for display
	 */
	async getActiveSponsorAds(limit?: number): Promise<SponsorAd[]> {
		return await sponsorAdRepo.getActiveSponsorAds(limit);
	}

	/**
	 * Get pending sponsor ads for admin review
	 */
	async getPendingSponsorAds(): Promise<SponsorAd[]> {
		return await sponsorAdRepo.getPendingSponsorAds();
	}

	/**
	 * Get sponsor ads with pagination and filters
	 */
	async getSponsorAdsPaginated(options: SponsorAdListOptions = {}): Promise<{
		sponsorAds: SponsorAd[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}> {
		return await sponsorAdRepo.getSponsorAdsPaginated(options);
	}

	/**
	 * Get sponsor ad statistics
	 */
	async getSponsorAdStats(): Promise<SponsorAdStats> {
		return await sponsorAdRepo.getSponsorAdStats();
	}

	// ===================== Write Operations =====================

	/**
	 * Create a new sponsor ad submission
	 */
	async createSponsorAd(
		userId: string,
		data: CreateSponsorAdRequest
	): Promise<SponsorAd> {
		// Check if user already has pending or active sponsor ad for this item
		const hasPending = await sponsorAdRepo.hasPendingSponsorAdForItem(
			userId,
			data.itemSlug
		);
		if (hasPending) {
			throw new Error(
				"You already have a pending sponsorship for this item"
			);
		}

		const hasActive = await sponsorAdRepo.hasActiveSponsorAdForItem(
			userId,
			data.itemSlug
		);
		if (hasActive) {
			throw new Error(
				"You already have an active sponsorship for this item"
			);
		}

		// Calculate amount based on interval
		const amount = this.getAmountForInterval(data.interval);

		const newSponsorAd: NewSponsorAd = {
			userId,
			itemSlug: data.itemSlug,
			itemName: data.itemName,
			itemIconUrl: data.itemIconUrl || null,
			itemCategory: data.itemCategory || null,
			itemDescription: data.itemDescription || null,
			interval: data.interval,
			amount,
			currency: "usd",
			paymentProvider: data.paymentProvider,
			status: SponsorAdStatus.PENDING,
		};

		return await sponsorAdRepo.createSponsorAd(newSponsorAd);
	}

	/**
	 * Approve sponsor ad (admin only)
	 */
	async approveSponsorAd(
		id: string,
		adminUserId: string
	): Promise<SponsorAd | null> {
		const sponsorAd = await sponsorAdRepo.getSponsorAdById(id);

		if (!sponsorAd) {
			throw new Error("Sponsor ad not found");
		}

		if (sponsorAd.status !== SponsorAdStatus.PENDING) {
			throw new Error(
				`Cannot approve sponsor ad with status: ${sponsorAd.status}`
			);
		}

		return await sponsorAdRepo.approveSponsorAd(id, adminUserId);
	}

	/**
	 * Reject sponsor ad (admin only)
	 */
	async rejectSponsorAd(
		id: string,
		adminUserId: string,
		rejectionReason: string
	): Promise<SponsorAd | null> {
		const sponsorAd = await sponsorAdRepo.getSponsorAdById(id);

		if (!sponsorAd) {
			throw new Error("Sponsor ad not found");
		}

		if (sponsorAd.status !== SponsorAdStatus.PENDING) {
			throw new Error(
				`Cannot reject sponsor ad with status: ${sponsorAd.status}`
			);
		}

		return await sponsorAdRepo.rejectSponsorAd(id, adminUserId, rejectionReason);
	}

	/**
	 * Activate sponsor ad after payment confirmation
	 */
	async activateSponsorAd(
		id: string,
		subscriptionId?: string,
		customerId?: string
	): Promise<SponsorAd | null> {
		const sponsorAd = await sponsorAdRepo.getSponsorAdById(id);

		if (!sponsorAd) {
			throw new Error("Sponsor ad not found");
		}

		if (sponsorAd.status !== SponsorAdStatus.APPROVED) {
			throw new Error(
				`Cannot activate sponsor ad with status: ${sponsorAd.status}. Must be approved first.`
			);
		}

		// Calculate start and end dates
		const startDate = new Date();
		const endDate = this.calculateEndDate(startDate, sponsorAd.interval);

		// Update with subscription info if provided
		if (subscriptionId || customerId) {
			await sponsorAdRepo.updateSponsorAd(id, {
				subscriptionId: subscriptionId || undefined,
				customerId: customerId || undefined,
			});
		}

		return await sponsorAdRepo.activateSponsorAd(id, startDate, endDate);
	}

	/**
	 * Cancel sponsor ad
	 */
	async cancelSponsorAd(
		id: string,
		cancelReason?: string
	): Promise<SponsorAd | null> {
		const sponsorAd = await sponsorAdRepo.getSponsorAdById(id);

		if (!sponsorAd) {
			throw new Error("Sponsor ad not found");
		}

		// Can only cancel pending, approved, or active sponsor ads
		const cancellableStatuses = [
			SponsorAdStatus.PENDING,
			SponsorAdStatus.APPROVED,
			SponsorAdStatus.ACTIVE,
		];

		if (!cancellableStatuses.includes(sponsorAd.status as typeof SponsorAdStatus.PENDING)) {
			throw new Error(
				`Cannot cancel sponsor ad with status: ${sponsorAd.status}`
			);
		}

		return await sponsorAdRepo.cancelSponsorAd(id, cancelReason);
	}

	/**
	 * Expire sponsor ad (called by cron job or webhook)
	 */
	async expireSponsorAd(id: string): Promise<SponsorAd | null> {
		const sponsorAd = await sponsorAdRepo.getSponsorAdById(id);

		if (!sponsorAd) {
			throw new Error("Sponsor ad not found");
		}

		if (sponsorAd.status !== SponsorAdStatus.ACTIVE) {
			throw new Error(
				`Cannot expire sponsor ad with status: ${sponsorAd.status}`
			);
		}

		return await sponsorAdRepo.expireSponsorAd(id);
	}

	/**
	 * Renew sponsor ad subscription
	 */
	async renewSponsorAd(id: string): Promise<SponsorAd | null> {
		const sponsorAd = await sponsorAdRepo.getSponsorAdById(id);

		if (!sponsorAd) {
			throw new Error("Sponsor ad not found");
		}

		// Can only renew active or expired sponsor ads
		if (
			sponsorAd.status !== SponsorAdStatus.ACTIVE &&
			sponsorAd.status !== SponsorAdStatus.EXPIRED
		) {
			throw new Error(
				`Cannot renew sponsor ad with status: ${sponsorAd.status}`
			);
		}

		// Calculate new end date from current end date or now
		const startDate = sponsorAd.endDate || new Date();
		const endDate = this.calculateEndDate(startDate, sponsorAd.interval);

		return await sponsorAdRepo.updateSponsorAd(id, {
			status: SponsorAdStatus.ACTIVE,
			startDate,
			endDate,
		});
	}

	/**
	 * Delete sponsor ad (admin only, hard delete)
	 */
	async deleteSponsorAd(id: string): Promise<void> {
		const sponsorAd = await sponsorAdRepo.getSponsorAdById(id);

		if (!sponsorAd) {
			throw new Error("Sponsor ad not found");
		}

		await sponsorAdRepo.deleteSponsorAd(id);
	}

	// ===================== Helper Methods =====================

	/**
	 * Get amount in cents for interval
	 */
	getAmountForInterval(interval: string): number {
		if (interval === SponsorAdInterval.WEEKLY) {
			return SponsorAdPricing.WEEKLY;
		}
		if (interval === SponsorAdInterval.MONTHLY) {
			return SponsorAdPricing.MONTHLY;
		}
		throw new Error(`Invalid interval: ${interval}`);
	}

	/**
	 * Calculate end date based on interval
	 */
	calculateEndDate(startDate: Date, interval: string): Date {
		const endDate = new Date(startDate);

		if (interval === SponsorAdInterval.WEEKLY) {
			endDate.setDate(endDate.getDate() + 7);
		} else if (interval === SponsorAdInterval.MONTHLY) {
			endDate.setMonth(endDate.getMonth() + 1);
		} else {
			throw new Error(`Invalid interval: ${interval}`);
		}

		return endDate;
	}

	/**
	 * Format amount for display
	 */
	formatAmount(amountInCents: number, currency: string = "usd"): string {
		const formatter = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		});
		return formatter.format(amountInCents / 100);
	}

	/**
	 * Get interval display name
	 */
	getIntervalDisplayName(interval: string): string {
		const names: Record<string, string> = {
			[SponsorAdInterval.WEEKLY]: "Weekly",
			[SponsorAdInterval.MONTHLY]: "Monthly",
		};
		return names[interval] || interval;
	}

	/**
	 * Get status display name
	 */
	getStatusDisplayName(status: string): string {
		const names: Record<string, string> = {
			[SponsorAdStatus.PENDING]: "Pending Review",
			[SponsorAdStatus.APPROVED]: "Approved",
			[SponsorAdStatus.REJECTED]: "Rejected",
			[SponsorAdStatus.ACTIVE]: "Active",
			[SponsorAdStatus.EXPIRED]: "Expired",
			[SponsorAdStatus.CANCELLED]: "Cancelled",
		};
		return names[status] || status;
	}

	/**
	 * Check if sponsor ad can be edited
	 */
	canEdit(sponsorAd: SponsorAd): boolean {
		return sponsorAd.status === SponsorAdStatus.PENDING;
	}

	/**
	 * Check if sponsor ad can be cancelled
	 */
	canCancel(sponsorAd: SponsorAd): boolean {
		return [
			SponsorAdStatus.PENDING,
			SponsorAdStatus.APPROVED,
			SponsorAdStatus.ACTIVE,
		].includes(sponsorAd.status as typeof SponsorAdStatus.PENDING);
	}
}

// Export singleton instance
export const sponsorAdService = new SponsorAdService();
