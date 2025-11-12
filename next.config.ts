import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from '@sentry/nextjs';
import { sentryWebpackPluginOptions } from './sentry.config';
import { generateImageRemotePatterns } from './lib/utils/image-domains';

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@heroui/react", "lucide-react"],
  },
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
  staticPageGenerationTimeout: 180,
  webpack: (config, { dev }) => {
    config.ignoreWarnings = [
      { module: /@supabase\/realtime-js/ }
    ];

    // Exclude .content/ directory from webpack watching in development
    // Prevents rebuilds when content files change (220+ markdown files)
    if (dev) {
      config.watchOptions = config.watchOptions || {};
      config.watchOptions.ignored = [
        '**/node_modules/**',
        '**/.git/**',
        '**/.content/**'
      ];
    }

    return config;
  },
  images: {
    remotePatterns: generateImageRemotePatterns(),
    // Allow SVG images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Keep optimization enabled for better performance
    unoptimized: false,
  },
  async rewrites() {
    return [
      {
        source: "/:path",
        destination: "/:path/discover/1",
      },
      {
        source: "/:path/discover",
        destination: "/:path/discover/1",
      },
    ];
  },
} satisfies NextConfig;

const withNextIntl = createNextIntlPlugin();

// Apply plugins in the correct order
const configWithIntl = withNextIntl(nextConfig);

// Sentry configuration with type casting to avoid TypeScript errors
const finalConfig = withSentryConfig(configWithIntl, sentryWebpackPluginOptions) as NextConfig;

export default finalConfig;
