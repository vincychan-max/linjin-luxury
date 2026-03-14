import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // 关键修复：关闭优化，解决 Firebase/Facebook 等外部 CDN 图片 403 问题
    unoptimized: true,

    remotePatterns: [
      // Firebase Storage（产品图片、头像等）
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      // Google CDN（Google 登录头像）
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      // Facebook CDN（Facebook 登录头像，新增）
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        pathname: '/**',
      },
      // Wikipedia（产品示例图）
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      // 占位图（测试用）
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],

    // 现代格式优先
    formats: ['image/avif', 'image/webp'],
  },

  // 推荐优化配置
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;