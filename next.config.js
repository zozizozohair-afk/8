/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  webpack: (config, { dev }) => {
    // ============================================================
    // 1) Fix Watchpack errors (System Volume Information on Windows)
    // ============================================================
    const existingIgnored = config.watchOptions?.ignored;
    const ignorePatterns = ['**/System Volume Information/**', '**/$RECYCLE.BIN/**'];

    let ignored;
    if (existingIgnored instanceof RegExp) {
      ignored = new RegExp(
        `${existingIgnored.source}|[\\\\/]System Volume Information[\\\\/]|[\\\\/]\\$RECYCLE\\.BIN[\\\\/]`,
        existingIgnored.flags
      );
    } else if (Array.isArray(existingIgnored)) {
      ignored = [...existingIgnored, ...ignorePatterns];
    } else if (typeof existingIgnored === 'string' && existingIgnored.trim().length > 0) {
      ignored = [existingIgnored, ...ignorePatterns];
    } else {
      ignored = ignorePatterns;
    }

    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored,
    };

    // ============================================================
    // 2) DEV ONLY -> Switch cache to 'memory' to completely
    //    eliminate PackFileCacheStrategy errors (0.pack.gz / 1.pack.gz)
    //    which were causing 'Cannot find module ./vendor-chunks'
    // ============================================================
    if (dev) {
      config.cache = {
        type: 'memory',
        maxGenerations: 2,
      };
    }

    // ============================================================
    // 3) Apply splitChunks to BOTH SERVER + CLIENT compilations.
    //    The bug happened inside 'static-paths-worker' (SERVER build)
    //    which was looking for './vendor-chunks/...' inside the same
    //    webpack-runtime.js folder.  Static names prevent name drift
    //    between successive compilation passes inside jest-worker.
    // ============================================================
    if (config.optimization) {
      config.optimization.runtimeChunk = 'single';
      if (config.optimization.splitChunks && typeof config.optimization.splitChunks === 'object') {
        config.optimization.splitChunks = {
          ...config.optimization.splitChunks,
          chunks: 'all',
          // Static min-size for dev -> very small so EVERY vendor gets its chunk
          // (makes deterministic chunk map even under HMR)
          minSize: dev ? 10000 : 20000,
          maxAsyncRequests: 40,
          maxInitialRequests: 40,
          cacheGroups: {
            ...(config.optimization.splitChunks.cacheGroups || {}),
            default: false,
            defaultVendors: false,
            // -------- React / Next runtime --------
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
              priority: 60,
              enforce: true,
              reuseExistingChunk: true,
            },
            // -------- Critical vendor libs (static names!) --------
            'lib-framer-motion': {
              chunks: 'all',
              name: 'lib-framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 55,
              enforce: true,
              reuseExistingChunk: true,
            },
            'lib-supabase': {
              chunks: 'all',
              name: 'lib-supabase',
              test: /[\\/]node_modules[\\/](@supabase|supabase)[\\/]/,
              priority: 54,
              enforce: true,
              reuseExistingChunk: true,
            },
            'lib-lucide': {
              chunks: 'all',
              name: 'lib-lucide',
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              priority: 53,
              enforce: true,
              reuseExistingChunk: true,
            },
            // -------- Everything else goes in 'commons' --------
            commons: {
              chunks: 'all',
              name: 'commons',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        };
      }
    }

    return config;
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
