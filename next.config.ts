import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from '@sentry/nextjs';
import { sentryWebpackPluginOptions } from './sentry.config';

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@heroui/react", "lucide-react"],
  },
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
  staticPageGenerationTimeout: 180,
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /@supabase\/realtime-js/ }
    ];
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
        pathname: "/platform/**",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.flaticon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons.flaticon.com",
        pathname: "/**",
      },
    ],
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
