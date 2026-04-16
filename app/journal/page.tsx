import { hygraph } from "@/lib/hygraph";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from 'next';

// 1. ISR 配置：每 3600 秒（1小时）在后台重新生成静态页，兼顾速度与数据更新
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'The Journal | LINJIN LUXURY',
  description: 'Exploring the craftsmanship, M2C philosophy, and the world of LJL high-end fashion.',
  openGraph: {
    title: 'LJL Journal: Craftsmanship & Stories',
    description: 'Inside our workshop: Redefining modern luxury.',
    type: 'website',
  },
};

const GET_ALL_JOURNALS = `
  query GetAllJournals {
    journals(orderBy: date_DESC, first: 20) { 
      title
      slug
      date
      coverImage { url }
    }
  }
`;

export default async function JournalListPage() {
  let posts = [];
  try {
    const data: any = await hygraph.request(GET_ALL_JOURNALS);
    posts = data.journals || [];
  } catch (error) {
    console.error("ISR Fetch Error:", error);
  }

  return (
    <main className="bg-white min-h-screen pt-40 pb-32">
      <section className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-24">
          <p className="text-[10px] uppercase tracking-[0.6em] text-stone-400 mb-4 italic font-light font-sans">
            The World of LJL
          </p>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-stone-900 uppercase">
            Journal
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
          {posts.map((post: any) => (
            <Link key={post.slug} href={`/journal/${post.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#FBFBFB] mb-8 border border-stone-100">
                {post.coverImage?.url ? (
                  <Image
                    src={post.coverImage.url}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 italic text-[10px] tracking-widest">
                    LJL ARCHIVE
                  </div>
                )}
              </div>

              <div className="space-y-4 px-2">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-stone-400">
                  <span>Editorial</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-serif italic text-stone-900 group-hover:text-stone-500 transition-colors duration-500">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}