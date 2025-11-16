/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 13+ uses App Router by default, no experimental flag needed
  transpilePackages: ['@react-email/components', '@react-email/render'],
}

module.exports = nextConfig