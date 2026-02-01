import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Firebase Storage（头像上传用）
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      // Google CDN（Google 登录头像）
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Wikipedia（产品示例图）
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      // 占位图（测试用）
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // 如果以后用 Unsplash/Cloudinary 等，再加
    ],

    // 现代格式优先（更快、更小，推荐保留）
    formats: ['image/avif', 'image/webp'],

    // 移除 qualities（Next.js 官方 config 中没有这个选项，会被忽略或引起警告）
    // 如果需要控制质量，可在 <Image quality={xx} /> 组件里单独设置
  },

  // 推荐添加的常见优化配置（对 Vercel 部署友好，无副作用）
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
};

export default nextConfig;