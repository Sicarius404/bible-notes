import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@bible-notes/shared', '@bible-notes/pocketbase-client'],
}

export default nextConfig
