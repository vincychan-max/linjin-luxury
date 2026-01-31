import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Firebase Storage（头像上传用）
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      // Google CDN（Google 登录头像或外部图片常见）
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      // Wikipedia（你的产品示例图）
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
      // 可选：如果用其他 CDN（如 Unsplash、Cloudinary），继续加
      // {
      //   protocol: 'https',
      //   hostname: 'images.unsplash.com',
      //   pathname: '/**',
      // },
    ],

    // 高清质量支持（保持）
    qualities: [70, 75, 95],

    // 现代格式优先（更快、更清晰，保持）
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;