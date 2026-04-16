import { hygraph } from "@/lib/hygraph";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from 'next';
import Link from "next/link";

export const revalidate = 3600;

const GET_POST_DETAIL = `
  query GetPostDetail($slug: String!) {
    journal(where: { slug: $slug }) {
      title
      date
      content { html }
      coverImage { url }
    }
  }
`;

// 动态 SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data: any = await hygraph.request(GET_POST_DETAIL, { slug });
  const post = data?.journal;

  if (!post) return { title: 'Not Found | LJL' };

  return {
    title: `${post.title} | LJL Journal`,
    description: `Read the story behind ${post.title} at LinJin Luxury.`,
    openGraph: {
      title: post.title,
      images: [{ url: post.coverImage?.url || '' }],
      type: 'article',
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data: any = await hygraph.request(GET_POST_DETAIL, { slug });
  const post = data?.journal;

  if (!post) return notFound();

  // JSON-LD 结构化数据：让 Google 搜索结果更高级（带图带日期）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.coverImage?.url,
    "datePublished": post.date,
    "author": { "@type": "Brand", "name": "LinJin Luxury" },
  };

  return (
    <main className="bg-white min-h-screen pt-40 pb-32 font-sans">
      {/* 注入 JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-serif italic text-stone-900 mb-6 leading-tight">
            {post.title}
          </h1>
          <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-medium">
            Published on {post.date}
          </p>
        </header>

        {post.coverImage?.url && (
          <div className="relative aspect-[16/9] w-full mb-16 bg-stone-50 overflow-hidden">
            <Image src={post.coverImage.url} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        <section 
          className="prose prose-stone prose-lg md:prose-xl max-w-none 
            prose-headings:font-serif prose-headings:italic
            prose-p:font-light prose-p:leading-relaxed text-stone-800"
          dangerouslySetInnerHTML={{ __html: post.content.html }}
        />

        <div className="mt-24 pt-10 border-t border-stone-100">
          <Link href="/journal" className="text-[10px] uppercase tracking-[0.4em] text-stone-900 hover:text-stone-500 transition-colors">
            ← Back to Journal
          </Link>
        </div>
      </article>
    </main>
  );
}