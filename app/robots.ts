import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linjinluxury.com';

  return {
    rules: {
      userAgent: '*', 
      // 1. 明确允许的核心商业路径
      allow: [
        '/',
        '/limited',     // 限量档案/B2B 入口
        '/bespoke',     // 定制服务
        '/api/og',      // 🌟 重要：允许抓取生成的分享图，否则分享链接没图片
      ],
      // 2. 精准禁止无关或私密路径
      disallow: [
        '/api/',        // 排除其他 API 接口
        '/admin/',      
        '/checkout/',   
        '/my-account/', 
        '/auth/',       
        '/*?*',         // 🌟 建议：禁止抓取带参数的搜索/过滤链接，防止重复内容降权
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}