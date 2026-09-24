import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/:path*`,
      },
      {
        source: '/me/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/**',
      },
    ],
    qualities: [75, 100],
  },
};

export default nextConfig;
