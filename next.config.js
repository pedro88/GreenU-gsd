/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // typedRoutes disabled — causes false positives with dynamic route hrefs
    // typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

module.exports = nextConfig
