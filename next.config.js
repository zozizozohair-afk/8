/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use 'export' for production builds
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  webpack: (config) => {
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
    return config;
  },
};

module.exports = nextConfig;
