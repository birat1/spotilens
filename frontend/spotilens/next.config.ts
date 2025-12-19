import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/auth/:path*",
        destination: "http://localhost:8000/api/auth/:path*",
      },
      {
        source: "/me/:path*",
        destination: "http://localhost:8000/api/me/:path*",
      },
    ];
  },
};

export default nextConfig;
