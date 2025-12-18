"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardBody, Button, Input } from "@heroui/react";
import { Loader2, Megaphone, Calendar, DollarSign, CheckCircle, Search, AlertCircle } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
	savings?: string;
}

// ######################### Styling Constants #########################

const CARD_WRAPPER = "border-0 shadow-lg bg-white dark:bg-gray-900";
const CARD_HEADER = "px-6 py-4 border-b border-gray-100 dark:border-gray-800";
const CARD_BODY = "p-6";
const STEP_BADGE = "flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-lg";
const ITEM_PREVIEW = "flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4";
const ITEM_ICON_PLACEHOLDER = "flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 text-white";
const PRICING_CARD_BASE = "relative flex flex-col items-start rounded-xl border-2 p-5 text-left transition-all duration-300 cursor-pointer";
const PRICING_CARD_SELECTED = "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10";
const PRICING_CARD_UNSELECTED = "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md";
const SUMMARY_BOX = "rounded-xl bg-gray-50 dark:bg-gray-800/50 p-5";
const NOTICE_BOX = "rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20";
const SUBMIT_BUTTON = "w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30";
const SELECT_TRIGGER = cn(
	"flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm",
	"focus:outline-none focus:ring-2 focus:ring-blue-500",
	"disabled:cursor-not-allowed disabled:opacity-50"
);
const SELECT_CONTENT = "overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50";
const SELECT_ITEM = "relative flex items-center px-8 py-3 text-sm rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 outline-none data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700";

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
		savings: "Save 25%",
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
			<Card className={CARD_WRAPPER}>
				<div className={CARD_HEADER}>
					<div className="flex items-center gap-3">
						<div className={STEP_BADGE}>1</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								{t("SELECT_ITEM_TITLE")}
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{t("SELECT_ITEM_DESCRIPTION")}
							</p>
						</div>
					</div>
				</div>
				<CardBody className={CARD_BODY}>
					<div className="space-y-4">
						{/* Search */}
						<Input
							placeholder={t("SEARCH_PLACEHOLDER")}
							value={searchQuery}
							onValueChange={setSearchQuery}
							startContent={<Search className="w-4 h-4 text-gray-400" />}
							isClearable
							onClear={() => setSearchQuery("")}
							classNames={{
								input: "text-sm",
								inputWrapper: "h-12 rounded-xl",
							}}
						/>

						{/* Item Select */}
						{filteredItems.length > 0 ? (
							<Select.Root
								value={selectedItemSlug}
								onValueChange={setSelectedItemSlug}
							>
								<Select.Trigger className={SELECT_TRIGGER}>
									<Select.Value placeholder={t("SELECT_ITEM_PLACEHOLDER")} />
									<Select.Icon>
										<ChevronDown className="h-4 w-4 opacity-50" />
									</Select.Icon>
								</Select.Trigger>
								<Select.Portal>
									<Select.Content
										className={SELECT_CONTENT}
										position="popper"
										sideOffset={4}
									>
										<Select.Viewport className="p-1 max-h-[300px]">
											{filteredItems.map((item) => (
												<Select.Item
													key={item.slug}
													value={item.slug}
													className={SELECT_ITEM}
												>
													<Select.ItemIndicator className="absolute left-2 inline-flex items-center">
														<Check className="h-4 w-4 text-blue-500" />
													</Select.ItemIndicator>
													<Select.ItemText>{item.name}</Select.ItemText>
												</Select.Item>
											))}
										</Select.Viewport>
									</Select.Content>
								</Select.Portal>
							</Select.Root>
						) : (
							<p className="text-sm text-gray-500 dark:text-gray-400">{t("NO_ITEMS_FOUND")}</p>
						)}

						{/* Selected Item Preview */}
						{selectedItem && (
							<div className={ITEM_PREVIEW}>
								{selectedItem.icon_url ? (
									<Image
										src={selectedItem.icon_url}
										alt={selectedItem.name}
										width={48}
										height={48}
										className="h-12 w-12 rounded-xl object-cover"
									/>
								) : (
									<div className={ITEM_ICON_PLACEHOLDER}>
										<Megaphone className="h-6 w-6" />
									</div>
								)}
								<div className="flex-1 min-w-0">
									<p className="font-medium text-gray-900 dark:text-white truncate">
										{selectedItem.name}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{getCategoryName(selectedItem.category)}
									</p>
								</div>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
									<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
								</div>
							</div>
						)}
					</div>
				</CardBody>
			</Card>

			{/* Step 2: Select Duration */}
			<Card className={CARD_WRAPPER}>
				<div className={CARD_HEADER}>
					<div className="flex items-center gap-3">
						<div className={STEP_BADGE}>2</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								{t("SELECT_DURATION_TITLE")}
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{t("SELECT_DURATION_DESCRIPTION")}
							</p>
						</div>
					</div>
				</div>
				<CardBody className={CARD_BODY}>
					<div className="grid gap-4 sm:grid-cols-2">
						{PRICING_OPTIONS.map((option) => (
							<button
								key={option.id}
								type="button"
								onClick={() => setSelectedInterval(option.id)}
								className={cn(
									PRICING_CARD_BASE,
									selectedInterval === option.id
										? PRICING_CARD_SELECTED
										: PRICING_CARD_UNSELECTED
								)}
							>
								{option.savings && (
									<div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold shadow-lg">
										{option.savings}
									</div>
								)}
								<div className="flex w-full items-center justify-between mb-3">
									<span className="font-semibold text-gray-900 dark:text-white">
										{option.label}
									</span>
									{selectedInterval === option.id && (
										<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
											<CheckCircle className="h-4 w-4 text-white" />
										</div>
									)}
								</div>
								<div className="flex items-baseline gap-1 mb-2">
									<span className="text-3xl font-bold text-gray-900 dark:text-white">
										{formatCurrency(option.price)}
									</span>
								</div>
								<p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
									<Calendar className="h-4 w-4" />
									{option.description}
								</p>
							</button>
						))}
					</div>
				</CardBody>
			</Card>

			{/* Step 3: Summary & Submit */}
			<Card className={CARD_WRAPPER}>
				<div className={CARD_HEADER}>
					<div className="flex items-center gap-3">
						<div className={STEP_BADGE}>3</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								{t("SUMMARY_TITLE")}
							</h3>
						</div>
					</div>
				</div>
				<CardBody className={CARD_BODY}>
					{selectedItem && selectedPricing ? (
						<div className="space-y-4">
							<div className={SUMMARY_BOX}>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										{selectedItem.icon_url ? (
											<Image
												src={selectedItem.icon_url}
												alt={selectedItem.name}
												width={40}
												height={40}
												className="h-10 w-10 rounded-lg object-cover"
											/>
										) : (
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-500">
												<Megaphone className="h-5 w-5 text-white" />
											</div>
										)}
										<div>
											<p className="font-medium text-gray-900 dark:text-white">
												{selectedItem.name}
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{selectedPricing.label} {t("SPONSORSHIP")}
											</p>
										</div>
									</div>
									<p className="text-2xl font-bold text-gray-900 dark:text-white">
										{formatCurrency(selectedPricing.price)}
									</p>
								</div>
							</div>

							<div className={NOTICE_BOX}>
								<div className="flex gap-3">
									<AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
									<p className="text-sm text-amber-800 dark:text-amber-200">
										{t("APPROVAL_NOTICE")}
									</p>
								</div>
							</div>

							<Button
								onPress={handleSubmit}
								isDisabled={isSubmitting}
								isLoading={isSubmitting}
								size="lg"
								className={SUBMIT_BUTTON}
								startContent={!isSubmitting && <Megaphone className="h-4 w-4" />}
							>
								{isSubmitting ? t("SUBMITTING") : t("SUBMIT_FOR_REVIEW")}
							</Button>
						</div>
					) : (
						<div className="py-8 text-center">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
								<Megaphone className="h-6 w-6 text-gray-400" />
							</div>
							<p className="text-gray-500 dark:text-gray-400">
								{t("SELECT_ITEM_TO_CONTINUE")}
							</p>
						</div>
					)}
				</CardBody>
			</Card>
		</div>
	);
}
