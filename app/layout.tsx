import type { Metadata } from 'next';
import './globals.css';
import Header from './components/header';
import Footer from './components/Footer';
import PayPalProvider from './components/PayPalProvider';
import Script from 'next/script';
import { SupabaseProvider } from './components/providers/SupabaseProvider';

// ✅ 引入购物车抽屉、通知组件以及水合修复组件
import CartDrawer from './components/cart/CartDrawer'; 
import { Toaster } from 'react-hot-toast'; 
import { CartHydration } from './components/providers/CartHydration'; // 💡 必须创建并引入此组件

// 引入 Google Analytics 和 Tag Manager 组件
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

/**
 * ✅ 极致奢华与 M2C 品牌 SEO 配置
 */
export const metadata: Metadata = {
  title: {
    default: 'LINJIN LUXURY | Private Atelier Handbags | Artisanal Craftsmanship',
    template: '%s | LINJIN LUXURY',
  },
  description: 'LINJIN LUXURY handcrafted handbags made from premium noble leathers. Delivered directly from our private atelier, bypassing retail markups for pristine artisanal quality and timeless luxury.',
  keywords: 'LINJIN LUXURY, luxury handbags, handcrafted leather bags, artisan handbags, Box Calf leather handbags, Togo leather handbags, M2C luxury handbags, designer leather bags, limited edition handbags, women\'s luxury handbags, men\'s luxury handbags, premium leather accessories',
  metadataBase: new URL('https://www.linjinluxury.com'),
  
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  openGraph: {
    title: 'LINJIN LUXURY | From Our Atelier to Your Collection',
    description: 'Master-quality handcrafted handbags delivered directly to you. Experience the new era of luxury transparency.',
    images: [
      {
        url: '/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'LINJIN LUXURY - Artisanal Handbags',
      },
    ],
    locale: 'en_US',
    type: 'website',
    siteName: 'LINJIN LUXURY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LINJIN LUXURY | Handcrafted Luxury',
    description: 'Direct-to-consumer luxury leather goods.',
    images: ['/images/hero-main.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.linjinluxury.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ 品牌级 JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LINJIN LUXURY",
    "alternateName": "Linjin Atelier",
    "url": "https://www.linjinluxury.com",
    "logo": "https://www.linjinluxury.com/images/logo.png",
    "description": "A private atelier specializing in handcrafted luxury handbags, redefining the relationship between craft and consumer.",
    "brand": {
      "@type": "Brand",
      "name": "LINJIN LUXURY"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["en", "zh"]
    }
  };

  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      
      <body className="m-0 p-0 bg-white text-black min-h-screen flex flex-col antialiased">
        {/* 🌟 核心修复：在 Provider 之外手动触发购物车水合 */}
        <CartHydration />

        <SupabaseProvider>
          <PayPalProvider>
            {/* 导航栏强制浅色模式 */}
            <Header forcedTheme="light" />

            <main className="flex-1">
              {children}
            </main>

            <Footer />

            <CartDrawer />

            {/* 极简通知组件 */}
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
                  border: 'none',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase'
                },
              }} 
            />
          </PayPalProvider>
        </SupabaseProvider>

        {/* ✅ Tawk.to 客服脚本优化 */}
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