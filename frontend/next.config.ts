import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/chat': ['./wiki/**/*'],
  },
};

export default nextConfig;
