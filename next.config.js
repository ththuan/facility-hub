/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Set fixed port for development
  ...(process.env.NODE_ENV === 'development' && {
    env: {
      PORT: '3000',
    }
  }),
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@/lib', '@/components', '@/contexts'],
  },
  
  // Reduce bundle size
  webpack: (config, { dev, isServer }) => {
    // Optimize for production
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
          },
          common: {
            minChunks: 2,
            chunks: 'all',
            name: 'common',
            priority: 10,
          },
        },
      };
    }
    
    return config;
  },
  
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  
  // Enable SWC minification
  swcMinify: true,
  
  // Compress images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
}

module.exports = nextConfig
