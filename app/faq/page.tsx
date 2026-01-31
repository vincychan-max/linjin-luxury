import { Metadata } from 'next';
import FaqClient from './FaqClient';
import { db } from '@/lib/firebase';  // 确保你有 firebase config
import { collection, getDocs } from 'firebase/firestore';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | LINJIN LUXURY',
  description: 'Find answers to common questions about products, orders, shipping, returns, gifting, and client services.',
  openGraph: {
    title: 'FAQ | LINJIN LUXURY',
    description: 'All your questions about luxury shopping answered.',
  },
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  id: string;
  items: FaqItem[];
}

export default async function FAQPage() {
  // 从 Firestore fetch FAQ 数据
  const faqSnapshot = await getDocs(collection(db, 'faq_sections'));
  const faqData: FaqSection[] = [];

  faqSnapshot.forEach((doc) => {
    const data = doc.data();
    faqData.push({
      id: doc.id,
      title: data.title,
      items: data.items || [],
    });
  });

  // 可选：排序（按你想要的顺序）
  const order = ['products', 'orders', 'delivery', 'returns', 'gifting', 'services'];
  faqData.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="header">
        <h1>FREQUENTLY ASKED QUESTIONS</h1>
      </div>

      <div className="container">
        <FaqClient faqData={faqData} />

        <div className="contact">
          <p>Still haven&apos;t found the answer?</p>
          <p>
            Contact our Client Services:<br />
            <strong>1.866.LINJIN (1.866.884.8866)</strong><br />
            or email <a href="mailto:LINJINBAG@Gmail.com">LINJINBAG@Gmail.com</a>
          </p>
        </div>
      </div>
    </>
  );
}