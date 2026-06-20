import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // MDX サポート（将来の拡張用）
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Prevent a parent lockfile from being mistaken for this app's workspace root.
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // Server Components でファイルシステムアクセスを許可
  },
}

export default nextConfig
