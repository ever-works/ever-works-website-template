"use client";

import { useConfig } from "@/app/[locale]/config";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconEverworksSimple } from "@/components/icons/Icons";

export interface SiteLogoProps {
	size?: "sm" | "md" | "lg";
	className?: string;
	showText?: boolean;
	linkToHome?: boolean;
}

const SIZE_CONFIGS = {
	sm: {
		icon: "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 2xl:w-11 2xl:h-11",
		text: "text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl",
		image: { width: 140, height: 50 },
		iconMargin: "mr-2 sm:mr-3 md:mr-4 lg:mr-5",
	},
	md: {
		icon: "w-8 h-8 md:w-10 md:h-10",
		text: "text-sm md:text-base lg:text-lg",
		image: { width: 140, height: 50 },
		iconMargin: "mr-3",
	},
	lg: {
		icon: "w-10 h-10 md:w-12 md:h-12",
		text: "text-base md:text-lg lg:text-xl",
		image: { width: 140, height: 50 },
		iconMargin: "mr-4",
	},
};

export function SiteLogo({
	size = "md",
	className = "",
	showText = true,
	linkToHome = true,
}: SiteLogoProps) {
	const config = useConfig();
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const sizeConfig = SIZE_CONFIGS[size];
	const logoSettings = config.logo;
	const hasImageLogo = !!logoSettings?.logo_image;

	// Determine which image to use based on theme
	const getLogoImage = () => {
		if (!logoSettings?.logo_image) return null;

		// Use dark variant if available and theme is dark
		if (theme === "dark" && logoSettings.logo_image_dark) {
			return logoSettings.logo_image_dark;
		}

		return logoSettings.logo_image;
	};

	const renderLogoContent = () => {
		if (!mounted) {
			// Return placeholder during SSR to avoid hydration mismatch
			return (
				<div
					className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${sizeConfig.icon}`}
				/>
			);
		}

		if (hasImageLogo) {
			// Mode A: Image logo only
			const logoSrc = getLogoImage();
			return (
				<Image
					src={logoSrc!}
					alt={config.company_name || "Logo"}
					width={sizeConfig.image.width}
					height={sizeConfig.image.height}
					style={{ width: "auto", height: "auto" }}
					priority
				/>
			);
		}

		// Mode B: Text (company name) + optional favicon icon
		return (
			<>
				{logoSettings?.favicon && (
					<div className={`relative ${sizeConfig.iconMargin}`}>
						<Image
							src={logoSettings.favicon}
							alt=""
							width={40}
							height={40}
							className={`${sizeConfig.icon} transition-all duration-300 group-hover:scale-110`}
						/>
					</div>
				)}
				{!logoSettings?.favicon && (
					<div className={`relative ${sizeConfig.iconMargin}`}>
						<IconEverworksSimple
							className={`${sizeConfig.icon} transition-all duration-300 group-hover:scale-110`}
						/>
					</div>
				)}
				{showText && (
					<p
						className={`font-bold ${sizeConfig.text} transition-colors duration-200 group-hover:text-theme-primary`}
					>
						{config.company_name}
					</p>
				)}
			</>
		);
	};

	const containerClasses = `flex items-center group transition-transform duration-200 hover:scale-105 ${className}`;

	if (linkToHome) {
		return (
			<Link href="/" className={containerClasses}>
				{renderLogoContent()}
			</Link>
		);
	}

	return <div className={containerClasses}>{renderLogoContent()}</div>;
}
