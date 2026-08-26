import type { NextConfig } from 'next'
import withPWA from '@ducanh2912/next-pwa'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@bible-notes/shared', '@bible-notes/pocketbase-client'],
}

// next-pwa attaches a webpack config, which hard-blocks Turbopack (the Next 16
// dev default). PWA is disabled in development anyway, so only wrap in
// production builds — dev stays on Turbopack, prod keeps webpack + PWA.
export default process.env.NODE_ENV === 'development'
  ? nextConfig
  : withPWA({
      dest: 'public',
      register: true,
      skipWaiting: true,
      disable: false,
    })(nextConfig)
