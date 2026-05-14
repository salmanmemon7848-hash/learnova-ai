import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force fresh assets on every deploy to prevent stale cache
  generateBuildId: async () => {
    return Date.now().toString();
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', 'react-markdown'],
  },
  
  // Enable React compiler for better performance (optional, Next.js 15+)
  // reactCompiler: true,
  
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compress responses
  compress: true,
  
  // Enable powered by header removal for security
  poweredByHeader: false,
  
  // Turbopack configuration
  turbopack: {},
  
  // Optimize webpack for faster builds
  webpack: (config) => {
    // Reduce bundle size by tree shaking
    config.optimization.usedExports = true;
    return config;
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // SECURITY: Prevent MIME sniffing — OWASP A05:2021 Security Misconfiguration
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // SECURITY: Clickjacking protection — OWASP A05:2021 Security Misconfiguration
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // SECURITY: Legacy XSS filter
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
