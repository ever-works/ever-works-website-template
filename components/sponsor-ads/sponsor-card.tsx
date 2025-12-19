'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardBody, cn } from '@heroui/react';
import { FiFolder, FiExternalLink } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { SponsorBadge } from './sponsor-badge';
import { shouldShowFallback, isProblematicUrl } from '@/lib/utils/image-domains';
import { useTranslations } from 'next-intl';
import type { SponsorAd } from '@/lib/db/schema';

interface SponsorCardProps {
	sponsors: SponsorAd[];
	rotationInterval?: number; // in milliseconds, default 5000 (5 seconds)
	className?: string;
	variant?: 'default' | 'compact';
}

export function SponsorCard({
	sponsors,
	rotationInterval = 5000,
	className,
	variant = 'default'
}: SponsorCardProps) {
	const params = useParams();
	const locale = params?.locale as string | undefined;
	const t = useTranslations('sponsor');
	const [currentIndex, setCurrentIndex] = useState(0);

	// Time-based rotation
	useEffect(() => {
		if (sponsors.length <= 1) return;

		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % sponsors.length);
		}, rotationInterval);

		return () => clearInterval(interval);
	}, [sponsors.length, rotationInterval]);

	// Reset index if sponsors change
	useEffect(() => {
		setCurrentIndex(0);
	}, [sponsors]);

	if (!sponsors || sponsors.length === 0) {
		return null;
	}

	const currentSponsor = sponsors[currentIndex];
	const shouldShowFallbackIcon = shouldShowFallback(currentSponsor.itemIconUrl || '');
	const detailPath = `${locale ? `/${locale}` : ''}/items/${currentSponsor.itemSlug}`;

	const cardClassName = cn(
		'group relative border-0 rounded-2xl transition-all duration-300 backdrop-blur-xl overflow-hidden h-full',
		'bg-gradient-to-br from-blue-50/90 via-white/95 to-indigo-50/90',
		'dark:from-blue-950/40 dark:via-gray-900/90 dark:to-indigo-950/40',
		'shadow-lg hover:shadow-xl',
		'ring-1 ring-blue-200/50 dark:ring-blue-800/50 hover:ring-blue-300/70 dark:hover:ring-blue-700/70',
		className
	);

	if (variant === 'compact') {
		return (
			<Link href={detailPath} className="block">
				<Card className={cn(cardClassName, 'p-3')}>
					<div className="relative z-10 flex items-center gap-3">
						{/* Icon */}
						<div className="relative shrink-0">
							<div className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200/50 dark:from-blue-900/50 dark:to-indigo-900/50 dark:border-blue-700/30">
								{shouldShowFallbackIcon ? (
									<FiFolder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
								) : (
									<Image
										src={currentSponsor.itemIconUrl!}
										alt={`${currentSponsor.itemName} icon`}
										className="w-5 h-5 object-contain"
										width={20}
										height={20}
										unoptimized={isProblematicUrl(currentSponsor.itemIconUrl!)}
									/>
								)}
							</div>
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
									{currentSponsor.itemName}
								</span>
								<SponsorBadge variant="compact" size="sm" showIcon={false} />
							</div>
							{currentSponsor.itemCategory && (
								<span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
									{currentSponsor.itemCategory}
								</span>
							)}
						</div>

						<FiExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
					</div>
				</Card>
			</Link>
		);
	}

	// Default variant
	return (
		<Link href={detailPath} className="block">
			<Card className={cardClassName}>
				{/* Background pattern */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white/90 to-indigo-50/80 dark:from-blue-950/60 dark:via-gray-900/80 dark:to-indigo-950/80 transition-all duration-700" />
				<div
					className="absolute inset-0 opacity-5 dark:opacity-10"
					style={{
						backgroundImage:
							"url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233b82f6' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' /%3E%3C/g%3E%3C/svg%3E\")"
					}}
				/>

				{/* Content */}
				<div className="relative z-10">
					<CardHeader className="flex gap-4 pb-2">
						<div className="flex flex-col grow gap-3 min-w-0">
							<div className="flex justify-between items-start gap-3">
								<div className="flex items-center gap-4">
									{/* Icon */}
									<div className="relative shrink-0">
										<div className="absolute inset-0 w-12 h-12 rounded-2xl bg-blue-500/30 dark:bg-blue-400/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none" />
										<div className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200/50 group-hover:from-blue-200 group-hover:to-indigo-200 dark:from-blue-900/50 dark:to-indigo-900/50 dark:border-blue-700/30 dark:group-hover:from-blue-800/50 dark:group-hover:to-indigo-800/50 shadow-sm group-hover:shadow-md group-hover:scale-105 group-hover:rotate-2">
											{shouldShowFallbackIcon ? (
												<FiFolder className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110" />
											) : (
												<Image
													src={currentSponsor.itemIconUrl!}
													alt={`${currentSponsor.itemName} icon`}
													className="w-6 h-6 object-contain transition-transform duration-300 group-hover:scale-110"
													width={24}
													height={24}
													unoptimized={isProblematicUrl(currentSponsor.itemIconUrl!)}
												/>
											)}
										</div>
									</div>

									{/* Name */}
									<div className="flex-1 min-w-0">
										<div className="text-lg sm:text-base font-semibold leading-tight text-left text-gray-900 dark:text-white mb-1 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200">
											{currentSponsor.itemName}
										</div>
										<div className="w-0 h-0.5 bg-blue-300 dark:bg-blue-600 group-hover:w-12 transition-all duration-500 ease-out" />
									</div>
								</div>

								{/* Badge */}
								<SponsorBadge variant="default" size="sm" />
							</div>
						</div>
					</CardHeader>

					<CardBody className="pt-0 pb-4">
						{/* Category - styled to match regular Item cards */}
						{currentSponsor.itemCategory && (
							<div className="mb-2">
								<span className="inline-block bg-blue-50 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/30 capitalize shadow-sm">
									{currentSponsor.itemCategory}
								</span>
							</div>
						)}

						{/* Description */}
						{currentSponsor.itemDescription && (
							<p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 font-medium line-clamp-2">
								{currentSponsor.itemDescription}
							</p>
						)}

						{/* Rotation indicator */}
						{sponsors.length > 1 && (
							<div className="flex items-center gap-1.5 mt-3">
								{sponsors.map((_, idx) => (
									<button
										key={idx}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setCurrentIndex(idx);
										}}
										className={cn(
											'w-1.5 h-1.5 rounded-full transition-all duration-300',
											idx === currentIndex
												? 'bg-blue-500 w-4'
												: 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
										)}
										aria-label={`Show sponsor ${idx + 1}`}
									/>
								))}
							</div>
						)}
					</CardBody>
				</div>
			</Card>
		</Link>
	);
}
