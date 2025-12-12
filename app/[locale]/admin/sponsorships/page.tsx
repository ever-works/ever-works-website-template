"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/react";
import { Select, SelectItem } from "@/components/ui/select";
import {
	CheckCircle,
	XCircle,
	Clock,
	Ban,
	Trash2,
	Loader2,
	Search,
	DollarSign,
	Calendar,
	Megaphone,
} from "lucide-react";
import { UniversalPagination } from "@/components/universal-pagination";
import Image from "next/image";
import { useAdminSponsorAds } from "@/hooks/use-admin-sponsor-ads";
import { useTranslations } from "next-intl";
import type { SponsorAd } from "@/lib/db/schema";
import type { SponsorAdStatus } from "@/lib/types/sponsor-ad";

// ######################### Status Badge Component #########################

const STATUS_BADGE_STYLES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
	pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
	approved: { variant: "default", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
	active: { variant: "default", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
	rejected: { variant: "destructive", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
	expired: { variant: "secondary", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
	cancelled: { variant: "outline", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

function StatusBadge({ status }: { status: string }) {
	const style = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.pending;
	return (
		<Badge variant={style.variant} className={style.className}>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</Badge>
	);
}

// ######################### Main Component #########################

export default function AdminSponsorshipsPage() {
	const t = useTranslations("admin.SPONSORSHIPS");

	// Modal states
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [selectedSponsorAd, setSelectedSponsorAd] = useState<SponsorAd | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	// Use custom hook
	const {
		sponsorAds,
		stats,
		isLoading,
		isSubmitting,
		currentPage,
		totalPages,
		totalItems,
		statusFilter,
		searchTerm,
		approveSponsorAd,
		rejectSponsorAd,
		cancelSponsorAd,
		deleteSponsorAd,
		setStatusFilter,
		setSearchTerm,
		setCurrentPage,
	} = useAdminSponsorAds();

	// Handlers
	const handleApprove = async (id: string) => {
		await approveSponsorAd(id);
	};

	const openRejectModal = (sponsorAd: SponsorAd) => {
		setSelectedSponsorAd(sponsorAd);
		setRejectionReason("");
		setRejectModalOpen(true);
	};

	const handleReject = async () => {
		if (!selectedSponsorAd || rejectionReason.length < 10) return;
		const success = await rejectSponsorAd(selectedSponsorAd.id, rejectionReason);
		if (success) {
			setRejectModalOpen(false);
			setSelectedSponsorAd(null);
			setRejectionReason("");
		}
	};

	const handleCancel = async (id: string) => {
		if (!confirm(t("CONFIRM_CANCEL"))) return;
		await cancelSponsorAd(id);
	};

	const handleDelete = async (id: string) => {
		if (confirmDeleteId !== id) {
			setConfirmDeleteId(id);
			return;
		}
		await deleteSponsorAd(id);
		setConfirmDeleteId(null);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount / 100);
	};

	const formatDate = (date: Date | string | null) => {
		if (!date) return "-";
		return new Date(date).toLocaleDateString();
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold">{t("TITLE")}</h1>
				<p className="text-muted-foreground">{t("SUBTITLE")}</p>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("TOTAL_STAT")}</p>
								<p className="text-2xl font-bold">{stats?.overview.total || 0}</p>
							</div>
							<Megaphone className="w-8 h-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("PENDING_STAT")}</p>
								<p className="text-2xl font-bold">{stats?.overview.pending || 0}</p>
							</div>
							<Clock className="w-8 h-8 text-yellow-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("ACTIVE_STAT")}</p>
								<p className="text-2xl font-bold">{stats?.overview.active || 0}</p>
							</div>
							<CheckCircle className="w-8 h-8 text-green-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{t("REVENUE_STAT")}</p>
								<p className="text-2xl font-bold">
									{formatCurrency(stats?.revenue.totalRevenue || 0)}
								</p>
							</div>
							<DollarSign className="w-8 h-8 text-emerald-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									placeholder={t("SEARCH_PLACEHOLDER")}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<div className="w-full md:w-48">
							<Select
								selectedKeys={statusFilter ? [statusFilter] : ["all"]}
								onSelectionChange={(keys) => {
									const value = keys[0];
									setStatusFilter(value === "all" ? undefined : (value as SponsorAdStatus));
								}}
								placeholder={t("FILTER_BY_STATUS")}
							>
								<SelectItem value="all">{t("ALL_STATUSES")}</SelectItem>
								<SelectItem value="pending">{t("STATUS_PENDING")}</SelectItem>
								<SelectItem value="approved">{t("STATUS_APPROVED")}</SelectItem>
								<SelectItem value="active">{t("STATUS_ACTIVE")}</SelectItem>
								<SelectItem value="rejected">{t("STATUS_REJECTED")}</SelectItem>
								<SelectItem value="expired">{t("STATUS_EXPIRED")}</SelectItem>
								<SelectItem value="cancelled">{t("STATUS_CANCELLED")}</SelectItem>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Sponsor Ads List */}
			<Card>
				<CardHeader>
					<CardTitle>{t("SPONSOR_ADS_TITLE")}</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="w-8 h-8 animate-spin" />
						</div>
					) : sponsorAds.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							{t("NO_SPONSOR_ADS_FOUND")}
						</div>
					) : (
						<div className="space-y-4">
							{sponsorAds.map((sponsorAd) => (
								<div
									key={sponsorAd.id}
									className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
								>
									<div className="flex items-center space-x-4">
										{sponsorAd.itemIconUrl ? (
											<Image
												src={sponsorAd.itemIconUrl}
												alt={sponsorAd.itemName}
												width={48}
												height={48}
												className="w-12 h-12 rounded-lg object-cover"
											/>
										) : (
											<div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
												<Megaphone className="w-6 h-6 text-muted-foreground" />
											</div>
										)}

										<div className="space-y-1">
											<h3 className="font-semibold">{sponsorAd.itemName}</h3>
											<p className="text-sm text-muted-foreground">
												{sponsorAd.itemSlug}
												{sponsorAd.itemCategory && ` • ${sponsorAd.itemCategory}`}
											</p>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<span className="capitalize">{sponsorAd.interval}</span>
												<span>•</span>
												<span>{formatCurrency(sponsorAd.amount)}</span>
												{sponsorAd.startDate && (
													<>
														<span>•</span>
														<Calendar className="w-3 h-3" />
														<span>{formatDate(sponsorAd.startDate)}</span>
														{sponsorAd.endDate && (
															<span>- {formatDate(sponsorAd.endDate)}</span>
														)}
													</>
												)}
											</div>
											{sponsorAd.rejectionReason && (
												<p className="text-xs text-red-500">
													{t("REJECTION_REASON")}: {sponsorAd.rejectionReason}
												</p>
											)}
										</div>
									</div>

									<div className="flex items-center gap-2 flex-wrap">
										<StatusBadge status={sponsorAd.status} />

										{/* Action buttons based on status */}
										{sponsorAd.status === "pending" && (
											<>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleApprove(sponsorAd.id)}
													disabled={isSubmitting}
													className="text-green-600 hover:text-green-700"
												>
													<CheckCircle className="w-4 h-4 mr-1" />
													{t("APPROVE")}
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => openRejectModal(sponsorAd)}
													disabled={isSubmitting}
													className="text-red-600 hover:text-red-700"
												>
													<XCircle className="w-4 h-4 mr-1" />
													{t("REJECT")}
												</Button>
											</>
										)}

										{(sponsorAd.status === "pending" ||
											sponsorAd.status === "approved" ||
											sponsorAd.status === "active") && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleCancel(sponsorAd.id)}
												disabled={isSubmitting}
											>
												<Ban className="w-4 h-4 mr-1" />
												{t("CANCEL")}
											</Button>
										)}

										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(sponsorAd.id)}
											disabled={isSubmitting}
											className={
												confirmDeleteId === sponsorAd.id
													? "text-red-600 hover:text-red-700"
													: ""
											}
										>
											<Trash2 className="w-4 h-4" />
											{confirmDeleteId === sponsorAd.id && (
												<span className="ml-1">{t("CONFIRM_DELETE")}</span>
											)}
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Pagination */}
			{totalPages > 1 && (
				<UniversalPagination
					page={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			)}

			{/* Reject Modal */}
			<Modal isOpen={rejectModalOpen} onOpenChange={setRejectModalOpen}>
				<ModalContent>
					<ModalHeader>
						<h2 className="text-xl font-semibold">{t("REJECT_MODAL_TITLE")}</h2>
					</ModalHeader>
					<ModalBody>
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								{t("REJECT_MODAL_DESCRIPTION")}
							</p>
							{selectedSponsorAd && (
								<div className="p-3 bg-muted rounded-lg">
									<p className="font-medium">{selectedSponsorAd.itemName}</p>
									<p className="text-sm text-muted-foreground">
										{selectedSponsorAd.itemSlug}
									</p>
								</div>
							)}
							<div>
								<Label htmlFor="rejectionReason">{t("REJECTION_REASON_LABEL")}</Label>
								<Textarea
									id="rejectionReason"
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									placeholder={t("REJECTION_REASON_PLACEHOLDER")}
									rows={4}
									className="mt-2"
								/>
								{rejectionReason.length > 0 && rejectionReason.length < 10 && (
									<p className="text-xs text-red-500 mt-1">
										{t("REJECTION_REASON_MIN_LENGTH")}
									</p>
								)}
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							variant="outline"
							onClick={() => setRejectModalOpen(false)}
							disabled={isSubmitting}
						>
							{t("CANCEL_BUTTON")}
						</Button>
						<Button
							variant="destructive"
							onClick={handleReject}
							disabled={isSubmitting || rejectionReason.length < 10}
						>
							{isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
							{t("REJECT_BUTTON")}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
}
