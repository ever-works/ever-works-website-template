import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { checkEnvironmentVariables } from './lib/config/check-env';

// Check environment variables
checkEnvironmentVariables();

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@heroui/react", "lucide-react"],
  },
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
  staticPageGenerationTimeout: 180,
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
    ],
  },
  /* config options here */
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
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
