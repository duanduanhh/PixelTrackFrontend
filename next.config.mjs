import { API_BASE_URL } from './lib/config.ts'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${API_BASE_URL}/:path*`, // 使用配置文件中的 API 地址
      },
    ]
  },
}

export default nextConfig
