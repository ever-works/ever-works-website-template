import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/config';

// Explicitly set Node.js runtime to allow Node.js modules (fs, path)
// Edge runtime does not support Node.js APIs required by fetchItem()
export const runtime = 'nodejs';
export const alt = `${siteConfig.name} Item`;
export const size = {
	width: 1200,
	height: 630
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string; locale: string } }) {
	const { slug } = params;
	const gradient = `linear-gradient(135deg, ${siteConfig.ogImage.gradientStart} 0%, ${siteConfig.ogImage.gradientEnd} 100%)`;

	try {
		// Dynamically import to avoid bundling fs in edge runtime
		const { fetchItem } = await import('@/lib/content');
		const item = await fetchItem(slug, { lang: params.locale });

		if (!item) {
			// Fallback for items not found
			return new ImageResponse(
				(
					<div
						style={{
							background: gradient,
							width: '100%',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'column',
							padding: '60px',
							fontFamily: 'system-ui, sans-serif'
						}}
					>
						<div
							style={{
								fontSize: 72,
								fontWeight: 'bold',
								color: 'white',
								textAlign: 'center'
							}}
						>
							{siteConfig.name}
						</div>
						<div
							style={{
								fontSize: 32,
								color: '#f0f0f0',
								marginTop: 20,
								textAlign: 'center'
							}}
						>
							{siteConfig.tagline}
						</div>
					</div>
				),
				{
					...size
				}
			);
		}

		const { meta } = item;
		const truncatedDescription = meta.description
			? meta.description.length > 120
				? `${meta.description.slice(0, 117)}...`
				: meta.description
			: '';

		return new ImageResponse(
			(
				<div
					style={{
						background: gradient,
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
						padding: '80px',
						fontFamily: 'system-ui, sans-serif'
					}}
				>
					{/* Logo/Icon section */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							marginBottom: 40
						}}
					>
						<div
							style={{
								fontSize: 28,
								color: '#f0f0f0',
								fontWeight: 600,
								background: 'rgba(255, 255, 255, 0.1)',
								padding: '12px 24px',
								borderRadius: '8px'
							}}
						>
							{siteConfig.name}
						</div>
					</div>

					{/* Item name */}
					<div
						style={{
							fontSize: 64,
							fontWeight: 'bold',
							color: 'white',
							textAlign: 'center',
							lineHeight: 1.2,
							marginBottom: 24,
							maxWidth: '90%'
						}}
					>
						{meta.name}
					</div>

					{/* Description */}
					{truncatedDescription && (
						<div
							style={{
								fontSize: 28,
								color: '#e0e0e0',
								textAlign: 'center',
								lineHeight: 1.4,
								maxWidth: '85%'
							}}
						>
							{truncatedDescription}
						</div>
					)}
				</div>
			),
			{
				...size
			}
		);
	} catch (error) {
		console.error('Error generating OG image:', error);

		// Fallback error image
		return new ImageResponse(
			(
				<div
					style={{
						background: gradient,
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
						padding: '60px',
						fontFamily: 'system-ui, sans-serif'
					}}
				>
					<div
						style={{
							fontSize: 72,
							fontWeight: 'bold',
							color: 'white',
							textAlign: 'center'
						}}
					>
						{siteConfig.name}
					</div>
				</div>
			),
			{
				...size
			}
		);
	}
}
