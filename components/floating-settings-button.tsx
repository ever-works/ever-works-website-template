"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSettingsModal } from "@/hooks/use-settings-modal";

const BUTTON_CLASSES = cn(
	"fixed bottom-6 right-6",
	"w-12 h-12",
	"flex items-center justify-center",
	"bg-theme-primary hover:bg-theme-primary-600",
	"text-white",
	"rounded-full",
	"shadow-lg hover:shadow-xl",
	"hover:scale-110",
	"transition-all duration-300",
	"z-40",
	"cursor-pointer",
	"group"
);

const TOOLTIP_CLASSES = cn(
	"absolute right-full mr-3",
	"px-3 py-2",
	"bg-gray-900 dark:bg-gray-700",
	"text-white text-sm font-medium",
	"rounded-lg shadow-lg",
	"whitespace-nowrap",
	"opacity-0 group-hover:opacity-100",
	"transition-opacity duration-200",
	"pointer-events-none"
);

export function FloatingSettingsButton() {
	const { openModal } = useSettingsModal();
	const [showTooltip, setShowTooltip] = useState(false);

	return (
		<button
			onClick={openModal}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
			className={BUTTON_CLASSES}
			aria-label="Open Settings"
			type="button"
		>
			<Settings className="h-6 w-6" />

			{/* Tooltip */}
			{showTooltip && (
				<span className={TOOLTIP_CLASSES}>
					Settings
				</span>
			)}
		</button>
	);
}
