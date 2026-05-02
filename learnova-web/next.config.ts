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
  
  // Fix CSP to allow eval in development (required for Turbopack)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.groq.com https://api.anthropic.com https://api.openai.com https://*.supabase.co https://*.supabase.in https://searxng.learnova-ai.com https://learnova-searxng.onrender.com http://localhost:* https://web.whatsapp.com https://wa.me",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
