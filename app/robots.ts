import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linjinluxury.com'; // 使用 env 动态域名，便于测试/生产切换

  return {
    rules: {
      userAgent: '*', // 适用于所有搜索引擎爬虫
      allow: '/',     // 允许抓取根路径及所有子路径（默认行为）
      disallow: [
        '/api/',      // 禁止抓取 API 接口（防止泄露敏感数据）
        '/admin/',    // 禁止抓取后台管理（如果有私有管理页）
        '/checkout/', // 禁止抓取结账页面（动态/用户特定）
        '/my-account/', // 禁止抓取个人中心（隐私保护）
        // 添加更多规则，例如 '/private/' 或 '/test/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`, // 指向您的站点地图
  }
}