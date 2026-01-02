import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Container } from "./ui/container";
import { CustomHeroFrontmatter } from "@/lib/content";
import Link from "next/link";

export interface CustomHeroProps {
	/** Markdown content to render */
	content: string;
	/** Frontmatter configuration */
	frontmatter?: CustomHeroFrontmatter;
	/** Additional classes for the container */
	className?: string;
	/** Show background effects (gradients, blobs) */
	showBackgroundEffects?: boolean;
	/** Additional content to display below the markdown */
	children?: React.ReactNode;
}

const buttonBaseStyles =
	"inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 no-underline";
const primaryStyles =
	"bg-theme-primary-600 hover:bg-theme-primary-700 text-white shadow-lg hover:shadow-xl";
const secondaryStyles =
	"bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700";

/**
 * Button component for CTA links in hero
 */
function HeroButton({
	href,
	children,
	variant = "primary",
}: {
	href: string;
	children: React.ReactNode;
	variant?: "primary" | "secondary";
}) {
	const isExternal = href.startsWith("http://") || href.startsWith("https://");
	const styles = cn(
		buttonBaseStyles,
		variant === "primary" ? primaryStyles : secondaryStyles
	);

	if (isExternal) {
		return (
			<a href={href} target="_blank" rel="noopener noreferrer" className={styles}>
				{children}
			</a>
		);
	}

	return (
		<Link href={href} className={styles}>
			{children}
		</Link>
	);
}

/**
 * Custom link component that supports CTA button styling
 * Regular links are styled as text links
 */
function HeroLink({
	href,
	children,
}: {
	href?: string;
	children?: React.ReactNode;
}) {
	if (!href) return <span>{children}</span>;

	const isExternal = href.startsWith("http://") || href.startsWith("https://");
	const linkStyles = "text-theme-primary-600 dark:text-theme-primary-400 hover:underline";

	if (isExternal) {
		return (
			<a href={href} target="_blank" rel="noopener noreferrer" className={linkStyles}>
				{children}
			</a>
		);
	}

	return (
		<Link href={href} className={linkStyles}>
			{children}
		</Link>
	);
}

interface LinkProps {
	href?: string;
	children?: React.ReactNode;
}

function isLinkElement(child: React.ReactNode): child is React.ReactElement<LinkProps> {
	return React.isValidElement(child) &&
		typeof (child.props as LinkProps).href === "string";
}

/**
 * Custom paragraph component for hero content
 * Detects CTA button groups (paragraphs with only links) and renders them as styled buttons
 * First link becomes primary button, subsequent links become secondary buttons
 */
function HeroParagraph({ children }: { children?: React.ReactNode }) {
	const childArray = React.Children.toArray(children);

	// Filter out whitespace-only text nodes
	const meaningfulChildren = childArray.filter((child) => {
		if (typeof child === "string") return child.trim() !== "";
		return true;
	});

	// Check if this paragraph contains only link elements (CTA pattern)
	const allLinks = meaningfulChildren.every((child) => isLinkElement(child));

	if (allLinks && meaningfulChildren.length > 0) {
		// Render as button group
		let linkIndex = 0;
		return (
			<div className="flex flex-wrap items-center justify-center gap-4 mt-6 not-prose">
				{React.Children.map(children, (child) => {
					if (typeof child === "string" && child.trim() === "") return null;
					if (isLinkElement(child)) {
						const variant = linkIndex === 0 ? "primary" : "secondary";
						linkIndex++;
						return (
							<HeroButton href={child.props.href || ""} variant={variant}>
								{child.props.children}
							</HeroButton>
						);
					}
					return child;
				})}
			</div>
		);
	}

	return (
		<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
			{children}
		</p>
	);
}

/**
 * Custom heading components for hero
 */
function HeroH1({ children }: { children?: React.ReactNode }) {
	return (
		<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
			{children}
		</h1>
	);
}

function HeroH2({ children }: { children?: React.ReactNode }) {
	return (
		<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
			{children}
		</h2>
	);
}

/**
 * Custom image component for hero
 * Uses next/image for optimization (lazy loading, responsive sizing, WebP conversion)
 */
function HeroImage({
	src,
	alt,
}: {
	src?: string;
	alt?: string;
}) {
	if (!src) return null;

	return (
		<div className="my-6 flex justify-center">
			<div className="relative w-full max-w-3xl aspect-video">
				<Image
					src={src}
					alt={alt || "Hero image"}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
					className="object-contain rounded-lg shadow-lg"
				/>
			</div>
		</div>
	);
}

const heroComponents = {
	a: HeroLink,
	p: HeroParagraph,
	h1: HeroH1,
	h2: HeroH2,
	img: HeroImage,
};

export default function CustomHero({
	content,
	frontmatter = {},
	className = "",
	showBackgroundEffects = true,
	children,
}: CustomHeroProps) {
	const {
		background_image,
		theme = "auto",
		alignment = "center",
		min_height = "auto",
		overlay_opacity = 0.5,
	} = frontmatter;

	const alignmentClasses = {
		left: "text-left items-start",
		center: "text-center items-center",
		right: "text-right items-end",
	};

	const themeClasses = {
		light: "bg-linear-to-br from-gray-50 via-white to-gray-100",
		dark: "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white",
		auto: "bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
	};

	return (
		<div
			className={cn(
				"w-full relative transition-colors duration-300",
				themeClasses[theme],
				className
			)}
			style={{ minHeight: min_height !== "auto" ? min_height : undefined }}
		>
			{/* Background Image */}
			{background_image && (
				<div
					className="absolute inset-0 bg-cover bg-center bg-no-repeat"
					style={{ backgroundImage: `url(${background_image})` }}
				>
					<div
						className="absolute inset-0 bg-black"
						style={{ opacity: overlay_opacity }}
					/>
				</div>
			)}

			{/* Background Effects */}
			{showBackgroundEffects && !background_image && (
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-0 -left-4 w-72 h-72 bg-linear-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-600/20 dark:to-blue-700/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
					<div className="absolute top-0 -right-4 w-72 h-72 bg-linear-to-r from-blue-600/10 to-blue-500/10 dark:from-blue-700/20 dark:to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
					<div className="absolute -bottom-8 left-20 w-72 h-72 bg-linear-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-600/20 dark:to-blue-700/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
				</div>
			)}

			{/* Main Content */}
			<div className="relative z-10 w-full">
				<div className="pt-12 pb-8 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16">
					<Container maxWidth="2xl" padding="default">
						<div
							className={cn(
								"flex flex-col",
								alignmentClasses[alignment]
							)}
						>
							<div
								className={cn(
									"prose prose-slate dark:prose-invert max-w-none",
									"prose-headings:mb-4 prose-p:mb-4",
									"prose-a:no-underline",
									background_image && "prose-headings:text-white prose-p:text-gray-200"
								)}
							>
								<MDXRemote
									source={content}
									components={heroComponents}
								/>
							</div>
						</div>
					</Container>
				</div>

				{/* Children section */}
				{children && <div className="mt-4 sm:mt-6">{children}</div>}
			</div>
		</div>
	);
}
