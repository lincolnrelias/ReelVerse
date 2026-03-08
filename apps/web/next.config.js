/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@reelverse/shared'],
  reactStrictMode: true,
};

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "reelverse",
  project: "reelverse-web",
});
