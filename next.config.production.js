// Production configuration for Next.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  // Content Security Policy
  async rewrites() {
    return [
      {
        source: '/api/analytics',
        destination: '/api/internal/analytics'
      }
    ];
  },

  // Image optimization
  images: {
    domains: ['supabase.co', 'cdn.jsdelivr.net'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false
  },

  // Bundle optimization
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          chat: {
            test: /[\\/](components|services|lib)[\\/]chat/,
            name: 'chat',
            chunks: 'all'
          }
        }
      };
    }

    return config;
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Output configuration
  output: 'standalone',
  
  // Compression
  compress: true,
  
  // Trailing slash
  trailingSlash: false,
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-chat',
        destination: '/workspace/teamspace',
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
