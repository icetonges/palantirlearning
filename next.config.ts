import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'everpath-course-content.s3-accelerate.amazonaws.com' },
      { protocol: 'https', hostname: 'cc.sj-cdn.net' },
      { protocol: 'https', hostname: '*.palantir.com' },
      { protocol: 'https', hostname: 'palantir.com' },
    ],
  },
}

export default nextConfig
