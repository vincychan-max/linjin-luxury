import { Metadata } from 'next';

/**
 * SEO & GEO Metadata Configuration
 * 针对 M2C 商业模式进行深度优化，建立品牌权威性 (E-E-A-T)
 */
export const metadata: Metadata = {
  // 核心标题：结合品牌名与商业模式，利于 AI 搜索提取摘要
  title: 'About LINJIN LUXURY | The Direct Manufacturer-to-Consumer Atelier',
  
  // 描述语：强化“垂直整合”与“全球配送”能力，增加 AI 搜索的语义关联
  description: 'LILINJIN LUXURY (LJL) offers archival, handcrafted luxury handbags and leather goods. As a vertically integrated manufacturer, we deliver directly from our private atelier to global clients.',
  
  // 关键词：覆盖从生产端到物流端的所有高权重词汇
  keywords: [
    'Handbag Manufacturer', 
    'M2C Luxury Business Model', 
    'Factory Direct Leather Goods', 
    'Artisanal Craftsmanship',
    'LINJIN LUXURY Supply Chain', 
    'Global Logistics Hubs',
    'Ethical Manufacturing China',
    'Vertical Integration Fashion'
  ],

  // 规范链接：确保 SEO 权重集中
  alternates: {
    canonical: 'https://linjinluxury.com/about',
  },

  // 社交分享优化 (Open Graph)
  openGraph: {
    title: 'LINJIN LUXURY: The Atelier Behind the Excellence',
    description: 'Eliminating intermediaries. Prioritizing materiality. Discover the direct path from our bench to your collection.',
    url: 'https://linjinluxury.com/about',
    siteName: 'LINJIN LUXURY',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/about-og-image.jpg', // 建议使用工厂内部或带有品牌标识的生产实景
        width: 1200,
        height: 630,
        alt: 'LINJIN LUXURY Global Manufacturing and Logistics Infrastructure',
      },
    ],
  },

  // Twitter (X) 卡片优化
  twitter: {
    card: 'summary_large_image',
    title: 'LINJIN LUXURY | Direct-to-Collector Origin',
    description: 'From the source to the street. Redefining luxury through manufacturing transparency.',
    images: ['/images/about-og-image.jpg'],
  },

  // 针对搜索机器人的指令
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="about-layout-container">
      {/* 这里不添加额外的边距或容器样式，以保证子组件（AboutPage）
         中定义的全屏背景和 Framer Motion 动效能够完美溢出到屏幕边缘
      */}
      {children}
    </section>
  )
}