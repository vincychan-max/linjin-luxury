import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // --- 核心：解决 Hygraph Hobby 429 ---
  experimental: {
    workerThreads: false,           // 禁用多线程
    cpus: 1,                        // 强制单核构建
    staticGenerationMaxConcurrency: 1,  // Next.js 15+ 推荐，严格限制每 worker 处理页面数量
    staticGenerationRetryCount: 2,  // 失败时自动重试 2 次（对 429 有帮助）
  },

  // 超时保护（产品页较多时建议用这个值）
  staticPageGenerationTimeout: 600,   // 10 分钟，先用这个测试

  // --- 图像优化（保持你的原配置，稍作精简）---
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.graphassets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.hygraph.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
    ],
  },

  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;