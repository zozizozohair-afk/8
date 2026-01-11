/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use 'export' for production builds
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
};

module.exports = nextConfig;
