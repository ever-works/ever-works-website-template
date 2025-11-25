"use client";

import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsModal } from "@/hooks/use-settings-modal";

const BUTTON_CLASSES = cn(
	"flex items-center gap-1.5",
	"transition-all duration-200",
	"font-medium whitespace-nowrap",
	"text-sm lg:text-base xl:text-lg",
	"text-gray-700 dark:text-gray-300",
	"hover:text-theme-primary dark:hover:text-theme-primary",
	"hover:scale-105",
	"cursor-pointer"
);

export function SettingsButton() {
	const { openModal } = useSettingsModal();

	return (
		<button
			onClick={openModal}
			className={BUTTON_CLASSES}
			aria-label="Open Settings"
			type="button"
		>
			<Settings className="h-4 w-4 lg:h-5 lg:w-5" />
			<span></span>
		</button>
	);
}
