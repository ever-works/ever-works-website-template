"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Loader2, Megaphone, Calendar, DollarSign, CheckCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { SponsorAdPricing } from "@/lib/constants";
import type { ItemData } from "@/lib/content";

// ######################### Types #########################

interface SponsorFormProps {
	items: ItemData[];
	locale: string;
	onSuccess?: (sponsorAdId: string) => void;
}

type IntervalType = "weekly" | "monthly";

interface PricingOption {
	id: IntervalType;
	label: string;
	price: number;
	description: string;
}

// ######################### Constants #########################

const PRICING_OPTIONS: PricingOption[] = [
	{
		id: "weekly",
		label: "Weekly",
		price: SponsorAdPricing.WEEKLY,
		description: "7 days of premium visibility",
	},
	{
		id: "monthly",
		label: "Monthly",
		price: SponsorAdPricing.MONTHLY,
		description: "30 days of premium visibility",
	},
];

// ######################### Helper Functions #########################

function formatCurrency(amountInCents: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amountInCents / 100);
}

function getCategoryName(category: ItemData["category"]): string {
	if (Array.isArray(category)) {
		const first = category[0];
		return typeof first === "string" ? first : first?.name || "";
	}
	return typeof category === "string" ? category : category?.name || "";
}

// ######################### Component #########################

export function SponsorForm({ items, locale, onSuccess }: SponsorFormProps) {
	const t = useTranslations("sponsor");
	const router = useRouter();

	// State
	const [selectedItemSlug, setSelectedItemSlug] = useState<string>("");
	const [selectedInterval, setSelectedInterval] = useState<IntervalType>("monthly");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Filtered items based on search
	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return items;
		const query = searchQuery.toLowerCase();
		return items.filter(
			(item) =>
				item.name.toLowerCase().includes(query) ||
				item.slug.toLowerCase().includes(query)
		);
	}, [items, searchQuery]);

	// Selected item details
	const selectedItem = useMemo(() => {
		return items.find((item) => item.slug === selectedItemSlug);
	}, [items, selectedItemSlug]);

	// Selected pricing option
	const selectedPricing = useMemo(() => {
		return PRICING_OPTIONS.find((option) => option.id === selectedInterval);
	}, [selectedInterval]);

	// Handle form submission
	const handleSubmit = async () => {
		if (!selectedItem) {
			toast.error(t("SELECT_ITEM_ERROR"));
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/sponsor-ads/user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					itemSlug: selectedItem.slug,
					itemName: selectedItem.name,
					itemIconUrl: selectedItem.icon_url || null,
					itemCategory: getCategoryName(selectedItem.category),
					itemDescription: selectedItem.description?.slice(0, 500) || null,
					interval: selectedInterval,
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to create sponsor ad");
			}

			toast.success(t("SUBMIT_SUCCESS"));

			if (onSuccess) {
				onSuccess(result.data.id);
			} else {
				// Redirect to user's sponsor ads page
				router.push(`/${locale}/account/sponsorships`);
			}
		} catch (error) {
			console.error("Error creating sponsor ad:", error);
			toast.error(
				error instanceof Error ? error.message : t("SUBMIT_ERROR")
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Step 1: Select Item */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
							1
						</span>
						{t("SELECT_ITEM_TITLE")}
					</CardTitle>
					<CardDescription>{t("SELECT_ITEM_DESCRIPTION")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t("SEARCH_PLACEHOLDER")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Item Select */}
					{filteredItems.length > 0 ? (
						<Select
							selectedKeys={selectedItemSlug ? [selectedItemSlug] : []}
							onSelectionChange={(keys) => {
								const value = keys[0];
								setSelectedItemSlug(value || "");
							}}
							placeholder={t("SELECT_ITEM_PLACEHOLDER")}
						>
							{filteredItems.map((item) => (
								<SelectItem key={item.slug} value={item.slug}>
									{item.name}
								</SelectItem>
							))}
						</Select>
					) : (
						<p className="text-sm text-muted-foreground">{t("NO_ITEMS_FOUND")}</p>
					)}

					{/* Selected Item Preview */}
					{selectedItem && (
						<div className="flex items-center gap-4 rounded-lg border p-4">
							{selectedItem.icon_url ? (
								<Image
									src={selectedItem.icon_url}
									alt={selectedItem.name}
									width={48}
									height={48}
									className="h-12 w-12 rounded-lg object-cover"
								/>
							) : (
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
									<Megaphone className="h-6 w-6 text-muted-foreground" />
								</div>
							)}
							<div className="flex-1">
								<p className="font-medium">{selectedItem.name}</p>
								<p className="text-sm text-muted-foreground">
									{getCategoryName(selectedItem.category)}
								</p>
							</div>
							<CheckCircle className="h-5 w-5 text-green-500" />
						</div>
					)}
				</CardContent>
			</Card>

			{/* Step 2: Select Duration */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
							2
						</span>
						{t("SELECT_DURATION_TITLE")}
					</CardTitle>
					<CardDescription>{t("SELECT_DURATION_DESCRIPTION")}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2">
						{PRICING_OPTIONS.map((option) => (
							<button
								key={option.id}
								type="button"
								onClick={() => setSelectedInterval(option.id)}
								className={`flex flex-col items-start rounded-lg border-2 p-4 text-left transition-colors ${
									selectedInterval === option.id
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary/50"
								}`}
							>
								<div className="flex w-full items-center justify-between">
									<span className="font-medium">{option.label}</span>
									{selectedInterval === option.id && (
										<CheckCircle className="h-5 w-5 text-primary" />
									)}
								</div>
								<div className="mt-2 flex items-center gap-1 text-2xl font-bold">
									<DollarSign className="h-5 w-5" />
									{formatCurrency(option.price).replace("$", "")}
								</div>
								<p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
									<Calendar className="h-3 w-3" />
									{option.description}
								</p>
							</button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Summary & Submit */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
							3
						</span>
						{t("SUMMARY_TITLE")}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{selectedItem && selectedPricing ? (
						<>
							<div className="rounded-lg bg-muted/50 p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">{selectedItem.name}</p>
										<p className="text-sm text-muted-foreground">
											{selectedPricing.label} {t("SPONSORSHIP")}
										</p>
									</div>
									<p className="text-xl font-bold">
										{formatCurrency(selectedPricing.price)}
									</p>
								</div>
							</div>

							<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
								<p className="text-sm text-yellow-800 dark:text-yellow-200">
									{t("APPROVAL_NOTICE")}
								</p>
							</div>

							<Button
								onClick={handleSubmit}
								disabled={isSubmitting}
								className="w-full"
								size="lg"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{t("SUBMITTING")}
									</>
								) : (
									<>
										<Megaphone className="mr-2 h-4 w-4" />
										{t("SUBMIT_FOR_REVIEW")}
									</>
								)}
							</Button>
						</>
					) : (
						<p className="text-center text-muted-foreground">
							{t("SELECT_ITEM_TO_CONTINUE")}
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
