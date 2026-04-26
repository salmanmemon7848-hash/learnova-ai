import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Compress responses
  compress: true,
};

export default nextConfig;
