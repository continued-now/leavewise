import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://t1.kakaocdn.net https://emrld.ltd",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://date.nager.at https://tequila.kiwi.com https://engine.hotellook.com https://www.google-analytics.com https://region1.google-analytics.com https://emrld.ltd https://tp.media",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        // Rate-limit hint headers on API routes
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=300' },
          { key: 'X-RateLimit-Limit', value: '60' },
        ],
      },
      {
        // Flight API should not be cached by CDN (dynamic pricing)
        source: '/api/flights',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        // Hotel cached data can be held for 1hr
        source: '/api/hotels',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=7200' },
        ],
      },
    ];
  },
};

export default nextConfig;
