import { hygraph } from "@/lib/hygraph";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Metadata } from "next";

export const revalidate = 3600;

const SITE_URL = "https://www.linjinluxury.com";

/** ====================== Metadata 2.0 ====================== */
export const metadata: Metadata = {
  title: "The Journal | LINJIN LUXURY",
  description:
    "Exploring craftsmanship, atelier stories, and the philosophy of modern luxury.",
  alternates: {
    canonical: `${SITE_URL}/journal`,
  },
  openGraph: {
    title: "The Journal | LINJIN LUXURY",
    description: "Atelier stories, craftsmanship insights and luxury philosophy.",
    url: `${SITE_URL}/journal`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-journal.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

/** ====================== Types ====================== */
interface Journal {
  title: string;
  slug: string;
  date: string;
  coverImage?: { url: string };
}

interface FormattedJournal extends Journal {
  image: string;
}

const FALLBACK_IMAGE = "/images/placeholder.jpg";

/** ====================== GraphQL ====================== */
const GET_ALL_JOURNALS = `
  query GetAllJournals {
    journals(
      orderBy: date_DESC
      first: 20
      stage: PUBLISHED
    ) {
      title
      slug
      date
      coverImage {
        url
      }
    }
  }
`;

/** ====================== Data Mapper ====================== */
function mapJournal(j: Journal): FormattedJournal {
  return {
    ...j,
    image: j.coverImage?.url || FALLBACK_IMAGE,
  };
}

/** ====================== JSON-LD ====================== */
function generateJsonLd(journals: FormattedJournal[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "The Journal | LINJIN LUXURY",
    url: `${SITE_URL}/journal`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: journals.length,
      itemListElement: journals.map((j, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/journal/${j.slug}`,
        name: j.title,
        image: j.image,
      })),
    },
  };
}

/** ====================== Page ====================== */
export default async function JournalListPage() {
  let posts: Journal[] = [];

  try {
    const data: any = await hygraph.request(GET_ALL_JOURNALS);
    posts = data?.journals || [];
  } catch (error) {
    console.error("Journal fetch error:", error);
  }

  const journals = posts.map(mapJournal);
  const jsonLd = generateJsonLd(journals);

  return (
    <main className="bg-white min-h-screen pt-40 pb-32">

      {/* JSON-LD */}
      <Script
        id="journal-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <header className="text-center mb-24">
          <p className="text-[10px] uppercase tracking-[0.6em] text-stone-400 mb-4 italic">
            The World of LJL
          </p>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-stone-900 uppercase">
            Journal
          </h1>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">

          {journals.map((post) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="group block"
            >

              <div className="relative aspect-[4/5] overflow-hidden bg-[#FBFBFB] mb-8 border border-stone-100">

                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

              </div>

              <div className="space-y-4 px-2">

                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-stone-400">
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