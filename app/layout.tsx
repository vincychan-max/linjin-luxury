import type { Metadata, Viewport } from 'next';
import './globals.css';

import Header from './components/header';
import Footer from './components/Footer';
import PayPalProvider from './components/PayPalProvider';
import Script from 'next/script';
import { SupabaseProvider } from './components/providers/SupabaseProvider';
import CartDrawer from './components/cart/CartDrawer';
import { Toaster } from 'react-hot-toast';
import { CartHydration } from './components/providers/CartHydration';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

/**
 * =========================
 * ✅ SEO + GEO METADATA
 * =========================
 */
export const metadata: Metadata = {
  title: {
    default: 'LINJIN LUXURY | Leather Bags & Accessories Supplier (Women & Men)',
    template: '%s | LINJIN Leather Goods Manufacturer',
  },

  description:
    'LINJIN LUXURY is a professional leather goods supplier offering women handbags, men bags and leather accessories. OEM & private label manufacturing with factory-direct wholesale pricing.',

  keywords: [
    'leather bags supplier',
    'handbag manufacturer',
    'leather goods wholesale',
    'women handbags wholesale',
    'men leather bags',
    'leather wallet supplier',
    'OEM leather goods',
    'private label handbags'
  ],

  metadataBase: new URL('https://www.linjinluxury.com'),

  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },

  openGraph: {
    title: 'LINJIN LUXURY | Leather Bags Manufacturer & Supplier',
    description: 'Women handbags, men bags and leather accessories. OEM & wholesale factory direct supplier.',
    url: 'https://www.linjinluxury.com',
    siteName: 'LINJIN LUXURY',
    type: 'website',
    images: [
      {
        url: '/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'LINJIN LUXURY Leather Bags',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'LINJIN LUXURY | Leather Bags Supplier',
    description: 'Women, men bags and leather accessories manufacturer.',
    images: ['/images/hero-main.jpg'],
  },

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

  alternates: {
    canonical: 'https://www.linjinluxury.com',
  },
};

/**
 * =========================
 * ✅ VIEWPORT（已修复：去掉不推荐配置）
 * =========================
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

/**
 * =========================
 * ✅ JSON-LD
 * =========================
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LINJIN LUXURY',
    url: 'https://www.linjinluxury.com',
    logo: 'https://www.linjinluxury.com/images/logo.png',
    image: 'https://www.linjinluxury.com/images/hero-main.jpg',

    description:
      'Leather goods manufacturer specializing in handbags, men bags and accessories.',

    knowsAbout: [
      'Leather Handbags',
      'Men Bags',
      'Leather Accessories',
      'OEM Manufacturing',
      'Private Label Goods',
    ],

    areaServed: ['SG', 'US', 'TH', 'VN', 'MX'],

    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Leather Goods Collection',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Women Handbags',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Men Bags',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Accessories',
        },
      ],
    },
  };

  return (
    <html lang="en">
      <head>
        {/* ✅ Font Awesome（已修复 crossOrigin） */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />

        <script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body className="m-0 p-0 bg-white text-black min-h-screen flex flex-col antialiased">
        <CartHydration />

        <SupabaseProvider>
          <PayPalProvider>
            <Header forcedTheme="light" />

            <main className="flex-1">{children}</main>

            <Footer />
            <CartDrawer />

            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#000',
                  color: '#fff',
                  fontSize: '11px',
                  borderRadius: '0px',
                  padding: '12px 24px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                },
              }}
            />
          </PayPalProvider>
        </SupabaseProvider>

        {/* Chat */}
        {process.env.NODE_ENV === 'production' && (
          <Script id="tawkto-script" strategy="lazyOnload">
            {`
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/697c8c2e1b7bfa1c382703f4/1jg7875ok';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `}
          </Script>
        )}

        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
      </body>
    </html>
  );
}