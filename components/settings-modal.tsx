"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useSettingsModal } from "@/hooks/use-settings-modal";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const BACKDROP_CLASSES = cn(
	"fixed inset-0",
	"bg-black/50 dark:bg-black/70",
	"backdrop-blur-sm",
	"z-50",
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
	"z-[60]",
	"overflow-hidden",
	"transition-all duration-300"
);

export function SettingsModal() {
	const { isOpen, closeModal } = useSettingsModal();
	const [mounted, setMounted] = useState(false);
	const t = useTranslations("settings");

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || !isOpen) {
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
				<div className="px-6 py-8">
					{/* Empty content area - settings will be added in future PRs */}
					<p className="text-gray-500 dark:text-gray-400 text-center">
						Settings options will be added here
					</p>
				</div>
			</div>
		</>,
		document.body
	);
}
