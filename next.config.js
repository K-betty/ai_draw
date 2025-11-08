/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
    // 允许从外部域名加载图片（用于生成的图片）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // 输出配置：支持静态导出（可选）
  // 如果启用静态导出，需要注释掉 API Routes 或使用客户端直接调用 API
  // output: process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' ? 'export' : undefined,
  
  // Vercel 优化配置
  experimental: {
    // 优化服务器组件
    serverComponentsExternalPackages: ['canvas', 'face-api.js'],
  },
  
  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig

