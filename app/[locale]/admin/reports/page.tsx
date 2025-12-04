"use client";

import { useState } from "react";
import { Button, Card, CardBody, Chip, Select, SelectItem } from "@heroui/react";
import { Flag, Search, Eye, Filter, X } from "lucide-react";
import { UniversalPagination } from "@/components/universal-pagination";
import { useAdminReports, type AdminReportItem } from "@/hooks/use-admin-reports";
import { ReportStatus, ReportContentType, ReportReason } from "@/lib/db/schema";
import type { ReportStatusValues, ReportContentTypeValues, ReportReasonValues } from "@/lib/db/schema";
import ReportReviewDialog from "@/components/admin/reports/report-review-dialog";
import { useTranslations } from "next-intl";

// Status badge colors
const STATUS_COLORS: Record<ReportStatusValues, "warning" | "primary" | "success" | "default"> = {
	pending: "warning",
	reviewed: "primary",
	resolved: "success",
	dismissed: "default"
};

// Reason labels
const REASON_LABELS: Record<ReportReasonValues, string> = {
	spam: "Spam",
	harassment: "Harassment",
	inappropriate: "Inappropriate",
	other: "Other"
};

// Content type labels
const CONTENT_TYPE_LABELS: Record<ReportContentTypeValues, string> = {
	item: "Item",
	comment: "Comment"
};

export default function AdminReportsPage() {
	const t = useTranslations("admin.ADMIN_REPORTS_PAGE");

	// Use custom hook
	const {
		reports,
		stats,
		isLoading,
		isLoadingStats,
		isFiltering,
		isUpdating,
		currentPage,
		totalPages,
		totalReports,
		searchTerm,
		statusFilter,
		contentTypeFilter,
		reasonFilter,
		updateReport,
		handlePageChange,
		handleSearch,
		setStatusFilter,
		setContentTypeFilter,
		setReasonFilter,
		clearFilters
	} = useAdminReports({
		page: 1,
		limit: 10
	});

	// Local state for review dialog
	const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
	const [reportToReview, setReportToReview] = useState<AdminReportItem | null>(null);

	// Handler functions
	const openReviewDialog = (report: AdminReportItem) => {
		setReportToReview(report);
		setReviewDialogOpen(true);
	};

	const closeReviewDialog = () => {
		setReviewDialogOpen(false);
		setReportToReview(null);
	};

	// Check if any filter is active
	const hasActiveFilters = searchTerm || statusFilter || contentTypeFilter || reasonFilter;

	if (isLoading) {
		return (
			<div className="p-6 max-w-7xl mx-auto">
				{/* Loading Header */}
				<div className="mb-8">
					<div className="bg-linear-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
								<div>
									<div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
									<div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse"></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Loading Table */}
				<Card className="border-0 shadow-lg">
					<CardBody className="p-0">
						<div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
							<div className="flex items-center justify-between">
								<div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse"></div>
								<div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse"></div>
							</div>
						</div>
						<div className="divide-y divide-gray-100 dark:divide-gray-800">
							{Array.from({ length: 5 }, (_, i) => (
								<div key={i} className="px-6 py-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-4 flex-1">
											<div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
											<div className="flex-1">
												<div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse mb-1"></div>
												<div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse"></div>
											</div>
										</div>
										<div className="flex items-center space-x-4">
											<div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
											<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse"></div>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardBody>
				</Card>

				<div className="mt-8 text-center">
					<div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
						<div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
						<span className="text-sm font-medium">{t("LOADING_REPORTS")}</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-7xl mx-auto">
			{/* Enhanced Header */}
			<div className="mb-8">
				<div className="bg-linear-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-center space-x-4">
							<div className="w-12 h-12 bg-linear-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
								<Flag className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
									{t("TITLE")}
								</h1>
								<p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
									<span>{t("SUBTITLE")}</span>
									<span className="hidden sm:inline">•</span>
									<span className="text-sm px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium">
										{stats?.pendingCount || 0} {t("PENDING")}
									</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			{!isLoadingStats && stats && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<Card className="border-0 shadow-md">
						<CardBody className="py-4">
							<p className="text-sm text-gray-500 dark:text-gray-400">{t("TOTAL_REPORTS")}</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
						</CardBody>
					</Card>
					<Card className="border-0 shadow-md bg-yellow-50 dark:bg-yellow-900/20">
						<CardBody className="py-4">
							<p className="text-sm text-yellow-600 dark:text-yellow-400">{t("PENDING")}</p>
							<p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pendingCount}</p>
						</CardBody>
					</Card>
					<Card className="border-0 shadow-md bg-green-50 dark:bg-green-900/20">
						<CardBody className="py-4">
							<p className="text-sm text-green-600 dark:text-green-400">{t("RESOLVED")}</p>
							<p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.resolvedCount}</p>
						</CardBody>
					</Card>
					<Card className="border-0 shadow-md">
						<CardBody className="py-4">
							<p className="text-sm text-gray-500 dark:text-gray-400">{t("BY_ITEMS")}</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{stats.byContentType?.item || 0}
							</p>
						</CardBody>
					</Card>
				</div>
			)}

			{/* Filters */}
			<div className="mb-6 space-y-4">
				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					<input
						type="text"
						placeholder={t("SEARCH_PLACEHOLDER")}
						value={searchTerm}
						onChange={(e) => handleSearch(e.target.value)}
						aria-label={t("SEARCH_PLACEHOLDER")}
						role="searchbox"
						className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
					/>
					{isFiltering && (
						<div className="absolute right-4 top-1/2 transform -translate-y-1/2">
							<div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
						</div>
					)}
				</div>

				{/* Filter Dropdowns */}
				<div className="flex flex-wrap gap-3 items-center">
					<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
						<Filter className="w-4 h-4" />
						<span>{t("FILTERS")}</span>
					</div>

					<Select
						placeholder={t("STATUS")}
						selectedKeys={statusFilter ? [statusFilter] : []}
						onSelectionChange={(keys) => {
							const value = Array.from(keys)[0] as ReportStatusValues | undefined;
							setStatusFilter(value);
						}}
						className="w-36"
						size="sm"
					>
						{Object.values(ReportStatus).map((status) => (
							<SelectItem key={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
						))}
					</Select>

					<Select
						placeholder={t("CONTENT_TYPE")}
						selectedKeys={contentTypeFilter ? [contentTypeFilter] : []}
						onSelectionChange={(keys) => {
							const value = Array.from(keys)[0] as ReportContentTypeValues | undefined;
							setContentTypeFilter(value);
						}}
						className="w-36"
						size="sm"
					>
						{Object.values(ReportContentType).map((type) => (
							<SelectItem key={type}>{CONTENT_TYPE_LABELS[type]}</SelectItem>
						))}
					</Select>

					<Select
						placeholder={t("REASON")}
						selectedKeys={reasonFilter ? [reasonFilter] : []}
						onSelectionChange={(keys) => {
							const value = Array.from(keys)[0] as ReportReasonValues | undefined;
							setReasonFilter(value);
						}}
						className="w-40"
						size="sm"
					>
						{Object.values(ReportReason).map((reason) => (
							<SelectItem key={reason}>{REASON_LABELS[reason]}</SelectItem>
						))}
					</Select>

					{hasActiveFilters && (
						<Button variant="light" size="sm" color="danger" onPress={clearFilters} startContent={<X className="w-4 h-4" />}>
							{t("CLEAR_ALL")}
						</Button>
					)}
				</div>

				{/* Results Summary */}
				{!isLoading && (
					<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
						<span>
							{t("SHOWING_REPORTS", { count: reports.length, total: totalReports })}
							{hasActiveFilters && <span className="ml-1">{t("FILTERED")}</span>}
						</span>
					</div>
				)}
			</div>

			{/* Reports List */}
			<Card className="border-0 shadow-lg">
				<CardBody className="p-0">
					<div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("REPORTS_TITLE")}</h3>
							<div className="text-sm text-gray-500 dark:text-gray-400">
								{totalReports} {t("REPORTS_TOTAL_COUNT")}
							</div>
						</div>
					</div>

					<div className="divide-y divide-gray-100 dark:divide-gray-800">
						{reports.length === 0 ? (
							<div className="px-6 py-12 text-center">
								<Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("NO_REPORTS_FOUND")}</h3>
								<p className="text-gray-500 dark:text-gray-400">
									{hasActiveFilters ? t("NO_REPORTS_SEARCH_DESCRIPTION") : t("NO_REPORTS_DESCRIPTION")}
								</p>
							</div>
						) : (
							reports.map((report) => (
								<div
									key={report.id}
									className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1 min-w-0">
											<div className="flex items-center flex-wrap gap-2 mb-2">
												<Chip size="sm" variant="flat" color={STATUS_COLORS[report.status]}>
													{report.status.charAt(0).toUpperCase() + report.status.slice(1)}
												</Chip>
												<Chip size="sm" variant="bordered">
													{CONTENT_TYPE_LABELS[report.contentType]}
												</Chip>
												<Chip size="sm" variant="dot" color="danger">
													{REASON_LABELS[report.reason]}
												</Chip>
											</div>
											<p className="font-medium text-gray-900 dark:text-white mb-1">
												{t("CONTENT_ID")}: {report.contentId}
											</p>
											{report.details && (
												<p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
													{report.details}
												</p>
											)}
											<div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
												<span>
													{t("REPORTED_BY")}: {report.reporter?.name || report.reporter?.email || t("UNKNOWN")}
												</span>
												<span>
													{t("DATE")}: {new Date(report.createdAt).toLocaleString()}
												</span>
											</div>
										</div>
										<div className="ml-4 shrink-0">
											<Button
												color="primary"
												variant="flat"
												size="sm"
												isDisabled={isUpdating === report.id}
												onPress={() => openReviewDialog(report)}
												startContent={<Eye className="h-4 w-4" />}
											>
												{t("REVIEW")}
											</Button>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</CardBody>
			</Card>

			{/* Pagination */}
			{totalReports > 0 && (
				<div className="mt-8 space-y-6">
					<div className="bg-linear-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-6 py-4 shadow-xs">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
							<div className="flex items-center space-x-2">
								<div className="w-2 h-2 bg-theme-primary rounded-full"></div>
								<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
									{t("SHOWING_RANGE", {
										start: (currentPage - 1) * 10 + 1,
										end: Math.min(currentPage * 10, totalReports),
										total: totalReports
									})}
								</span>
							</div>
							<div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
								<span>{t("PAGE_OF", { current: currentPage, total: totalPages })}</span>
								<span>•</span>
								<span>10 {t("PER_PAGE")}</span>
							</div>
						</div>
					</div>

					<div className="flex justify-center">
						<UniversalPagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} className="shadow-lg" />
					</div>
				</div>
			)}

			{/* Review Dialog */}
			{reportToReview && (
				<ReportReviewDialog
					report={reportToReview}
					open={reviewDialogOpen}
					onOpenChange={setReviewDialogOpen}
					onUpdate={updateReport}
					onClose={closeReviewDialog}
				/>
			)}
		</div>
	);
}
