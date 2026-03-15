import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitemap | LINJIN LUXURY',
  description: 'Navigate through the world of LJL. Explore our collections, craftsmanship, and bespoke services.',
};

export default function HTMLSitemap() {
  const sitemapData = [
    {
      category: "The Collections",
      links: [
        { name: "All Collections", href: "/collection" },
        { name: "Shoulder Bags", href: "/collection/shoulder-bags" },
        { name: "Tote Bags", href: "/collection/tote-bags" },
        { name: "Clutch Bags", href: "/collection/clutch-bags" },
        { name: "Crossbody Bags", href: "/collection/crossbody-bags" },
        { name: "Limited Edition", href: "/limited" },
      ]
    },
    {
      category: "The House",
      links: [
        { name: "The World of LJL", href: "/world-of-ljl" },
        { name: "Our Workshop (About)", href: "/about" },
        { name: "The Journal", href: "/journal" },
        { name: "Bespoke Service", href: "/bespoke" },
        { name: "Sustainability", href: "/sustainability" },
      ]
    },
    {
      category: "Client Service",
      links: [
        { name: "Contact Concierge", href: "/contact" },
        { name: "Shipping & Returns", href: "/shipping-returns" },
        { name: "Product Care Guide", href: "/faq" }, // 建议后续可细分
        { name: "Authenticity", href: "/faq" },
        { name: "Privacy Policy", href: "/privacy" },
      ]
    },
    {
      category: "My LJL",
      links: [
        { name: "Member Login", href: "/auth/login" },
        { name: "VIP Services", href: "/account" },
        { name: "Order History", href: "/my-orders" },
        { name: "Wishlist", href: "/wishlist" },
      ]
    }
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
            Linjin Luxury &copy; 2026 Crafted Excellence
          </p>
        </div>
      </div>
    </main>
  );
}