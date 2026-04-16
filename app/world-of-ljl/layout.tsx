import { Metadata } from 'next'

// SEO 与 品牌定位元数据
export const metadata: Metadata = {
  // 核心标题：突出品牌宇宙和匠心美学
  title: 'World of LJL | Artisanal Mastery & Timeless Design',
  description: 'Step into the universe of LinJin Luxury. Explore the mastery of hand-stitched leather, our signature icons, and the enduring elegance that defines the LJL soul.',
  
  // 关键词布局：侧重工艺细节和品牌感
  keywords: [
    'Artisanal Luxury Handbags', 
    'Hand-stitched Leather Goods', 
    'Saddle Stitching Craft', 
    'LJL Signature Icons', 
    'Timeless Fashion Design',
    'Luxury Brand Story'
  ],

  // 社交分享优化 (Open Graph)
  openGraph: {
    title: 'World of LJL | A Universe of Artisanal Luxury',
    description: 'Where every stitch tells a story of human mastery and eternal elegance.',
    type: 'article', // 使用 article 类型可以增加故事感
    images: [
      {
        url: '/images/world-og-image.jpg', // 建议使用最具大牌感的视觉大图
        width: 1200,
        height: 630,
        alt: 'The Universe of LinJin Luxury',
      },
    ],
  },
}

export default function WorldOfLJLLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="world-of-ljl-layout">
      {/* 可以在这里添加特定的全局动效包裹层，或保持简洁以提升加载速度 */}
      {children}
    </div>
  )
}