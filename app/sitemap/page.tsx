import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitemap | LINJIN LUXURY',
  description: 'Navigate through the world of LJL. Explore our collections, craftsmanship, and bespoke services.',
};

export default function HTMLSitemap() {
  const sitemapData = [
    {
      category: "Women's Universe", // 明确性别分类
      links: [
        { name: "All Women's Bags", href: "/women" },
        { name: "Shoulder Bags", href: "/women/shoulder-bags" },
        { name: "Tote Bags", href: "/women/tote-bags" },
        { name: "Crossbody Bags", href: "/women/crossbody-bags" },
        { name: "Limited Edition", href: "/limited" },
      ]
    },
    {
      category: "Men's Universe", // 新增：男士频道入口
      links: [
        { name: "All Men's Bags", href: "/men" },
        { name: "Briefcases", href: "/men/briefcases" },
        { name: "Backpacks", href: "/men/backpacks" },
        { name: "Small Leather Goods", href: "/men/wallets" },
        { name: "Bespoke Men's Service", href: "/bespoke" },
      ]
    },
    {
      category: "The House",
      links: [
        { name: "The World of LJL", href: "/world-of-ljl" },
        { name: "Our Workshop", href: "/about" }, 
        { name: "The Journal", href: "/journal" },
        { name: "Sustainability", href: "/sustainability" },
        { name: "Authenticity & Craft", href: "/verify" },
      ]
    },
    {
      category: "Client Service",
      links: [
        { name: "Contact Concierge", href: "/contact" },
        { name: "Shipping & Delivery", href: "/shipping" }, // 路径对齐
        { name: "Returns & Exchanges", href: "/policies/returns" },
        { name: "Product Care Guide", href: "/care" }, // 路径对齐
        { name: "Privacy Policy", href: "/policies/privacy" },
        { name: "Terms of Service", href: "/terms" }, // 新增法律条款
      ]
    },
  ];

  return (
    <main className="bg-white min-h-screen pt-40 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* 页面标题 */}
        <header className="mb-24 border-b border-stone-100 pb-12">
          <p className="text-[10px] uppercase tracking-[0.6em] text-stone-400 mb-4">Navigation</p>
          <h1 className="text-4xl md:text-5xl font-serif italic text-stone-900">Site Index</h1>
        </header>

        {/* 链接网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-20">
          {sitemapData.map((section, idx) => (
            <div key={idx} className="space-y-8">
              <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-900 opacity-40">
                {section.category}
              </h2>
              <ul className="flex flex-col space-y-5">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      href={link.href}
                      className="text-sm text-stone-600 hover:text-stone-900 hover:italic transition-all duration-300 inline-block group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-stone-900 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 底部装饰 */}
        <div className="mt-40 pt-10 border-t border-stone-100 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone-300">
            Linjin Luxury &copy; 2026 Crafted Excellence in Guangzhou
          </p>
        </div>
      </div>
    </main>
  );
}