import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linjinluxury.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
        ],
        disallow: [
          // 后台 & 系统
          '/admin/',
          '/api/',
          '/auth/',
          '/verify/',

          // 交易流程
          '/cart',
          '/checkout/',
          '/order-confirmation/',
          '/payment/',

          // 用户数据
          '/account/',
          '/my-orders/',
          '/wishlist/',

          // 搜索页
          '/search',
          '/search?*',

          // 组件
          '/components/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}