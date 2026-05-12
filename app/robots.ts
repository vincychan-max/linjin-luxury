import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // 自动处理环境变量，防止末尾斜杠导致双斜杠 URL (如 //sitemap.xml)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.linjinluxury.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // 1. 管理后台与系统敏感路径
          '/admin/',
          '/api/',
          '/auth/',
          '/verify/',

          // 2. 交易与结算流程 (避免重复抓取和保护用户隐私)
          '/cart',
          '/checkout/',
          '/order-confirmation/',
          '/payment/',

          // 3. 用户个人账户页面
          '/account/',
          '/my-orders/',
          '/wishlist/',

          // 4. 内部搜索结果页 (防止爬虫陷入无限的搜索参数循环，浪费抓取预算)
          '/search',
          '/search?*',

          // 5. 项目组件目录
          '/components/',
        ],
      },
    ],
    // 告诉 Google 你的站点地图在哪里
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}