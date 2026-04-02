import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' https://*.supabase.co https://openrouter.ai https://api.stripe.com https://www.paypal.com https://*.paypal.com",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Enable performance optimizations
  reactStrictMode: true,

  // Enable automatic static optimization
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Enable prefetching for faster navigation
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@supabase/ssr',
      'framer-motion'
    ]
  },

  // Configure webpack for better performance
  webpack: (config, { isServer }) => {
    // Reduce bundle size by excluding unnecessary modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Enable tree shaking
    config.optimization.concatenateModules = true;

    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

};

export default nextConfig;
