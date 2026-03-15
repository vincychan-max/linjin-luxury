import { Metadata } from 'next'

// SEO 与 GEO 核心元数据
export const metadata: Metadata = {
  // 核心标题：突出 M2C 和制造商身份
  title: 'About LJL | Direct Manufacturer to Consumer (M2C) Excellence',
  description: 'Discover the transparency of LinJin Luxury (LJL). As a direct manufacturer, we provide handcrafted premium handbags with a vertically integrated supply chain, serving Los Angeles, Singapore, Thailand, and China.',
  
  // 关键词布局：侧重商业模式和地理节点
  keywords: [
    'Handbag Manufacturer', 
    'M2C Fashion Business', 
    'Factory Direct Luxury', 
    'LinJin Luxury Supply Chain', 
    'Global Logistics Hubs',
    'Ethical Manufacturing'
  ],

  // 社交分享优化 (Open Graph)
  openGraph: {
    title: 'LJL: The Manufacturer Behind the Luxury',
    description: 'Eliminating intermediaries to deliver uncompromised quality directly from our atelier to you.',
    type: 'website',
    images: [
      {
        url: '/images/about-og-image.jpg', // 建议使用工厂实景或物流地图作为预览图
        width: 1200,
        height: 630,
        alt: 'LinJin Luxury Manufacturing and Global Logistics',
      },
    ],
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="about-layout-container">
      {/* 这里的布局保持简单，确保 About 页面的黑白对比感 */}
      {children}
    </div>
  )
}