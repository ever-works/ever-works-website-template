"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useSettingsModal } from "@/hooks/use-settings-modal";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import SelectPaginationType from "@/components/ui/select-pagination-type";

const BACKDROP_CLASSES = cn(
	"fixed inset-0",
	"bg-black/50 dark:bg-black/70",
	"backdrop-blur-sm",
	"z-[9998]",
	"transition-opacity duration-300"
);

const MODAL_CLASSES = cn(
	"fixed top-1/2 left-1/2",
	"transform -translate-x-1/2 -translate-y-1/2",
	"w-full max-w-2xl",
	"max-h-[90vh]",
	"bg-white dark:bg-gray-900",
	"border border-gray-200 dark:border-gray-700",
	"rounded-2xl shadow-2xl",
	"z-[9999]",
	"overflow-hidden",
	"transition-all duration-300"
);

const CONTENT_SECTION_CLASSES = cn("space-y-3");

const SECTION_HEADING_CLASSES = cn("text-sm font-semibold text-gray-900 dark:text-white");

const SECTION_DESC_CLASSES = cn("text-xs text-gray-500 dark:text-gray-400 mt-1");

const DIVIDER_CLASSES = cn("border-t border-gray-200 dark:border-gray-700");

export function SettingsModal() {
	const { isOpen, closeModal } = useSettingsModal();
	const [mounted, setMounted] = useState(false);
	const t = useTranslations("settings");

	if (!isOpen || typeof window === "undefined") {
		return null;
	}

	return createPortal(
		<>
			{/* Backdrop */}
			<div className={BACKDROP_CLASSES} onClick={closeModal} aria-hidden="true" />

			{/* Modal */}
			<div className={MODAL_CLASSES} role="dialog" aria-modal="true" aria-labelledby="settings-title">
				{/* Modal Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<h2 id="settings-title" className="text-xl font-semibold text-gray-900 dark:text-white">
						{t("SETTINGS")}
					</h2>
					<button
						onClick={closeModal}
						className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						aria-label={t("CLOSE_SETTINGS")}
						type="button"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Modal Content */}
				<div className="px-6 py-8 space-y-6">
					{/* Pagination Style Section */}
					<SelectPaginationType />

					{/* Divider for future sections */}
					<div className={DIVIDER_CLASSES} />

					{/* Future settings sections will go here */}
				</div>
			</div>
		</>,
		document.body
	);
}
