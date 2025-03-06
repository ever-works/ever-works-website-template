import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "export",
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
