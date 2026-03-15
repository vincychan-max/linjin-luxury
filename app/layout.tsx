import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import PayPalProvider from './components/PayPalProvider';
import Script from 'next/script';
import { SupabaseProvider } from './components/providers/SupabaseProvider';

// ✅ 1. 引入必要组件
import CartDrawer from './components/cart/CartDrawer'; 
import { Toaster } from 'react-hot-toast'; 

// 新增：引入 Google Analytics 和 Tag Manager 组件
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

// ✅ 方案 A：极简高级风 SEO 配置
export const metadata: Metadata = {
  title: {
    default: 'LINJIN LUXURY | Premium Supply Chain Handbags | LA Studio',
    template: '%s | LINJIN LUXURY',
  },
  description: 'Premium supply chain specialists for luxury handbags and fashion items. Crafted with exceptional quality and timeless design, delivered from our studio to your wardrobe.',
  keywords: 'Linjin Luxury, luxury designer handbags, premium supply chain, LA fashion studio, master-quality bags, luxury handbags Los Angeles, premium leather goods, designer tote bags, luxury shoulder bags, designer crossbody bags',
  metadataBase: new URL('https://www.linjinluxury.com'),
  
  // ✅ 图标配置：Next.js 会自动识别 /app 目录下的 icon.png
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png', 
  },

  openGraph: {
    title: 'LINJIN LUXURY | Premium Supply Chain Handbags | LA Studio',
    description: 'Premium supply chain specialists for luxury handbags and fashion items. Crafted with exceptional quality and timeless design.',
    images: [
      {
        url: '/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'LINJIN LUXURY - Premium Supply Chain Handbags',
      },
    ],
    locale: 'en_US',
    type: 'website',
    siteName: 'LINJIN LUXURY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LINJIN LUXURY | Premium Supply Chain Handbags',
    description: 'Premium supply chain specialists for luxury handbags and fashion items.',
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
  // ✅ 生成 JSON-LD 结构化数据，提升 Google 搜索的品牌呈现
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LINJIN LUXURY",
    "url": "https://www.linjinluxury.com",
    "logo": "https://www.linjinluxury.com/icon.png",
    "description": "Premium supply chain specialists for luxury handbags and fashion items.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Los Angeles",
      "addressRegion": "CA",
      "addressCountry": "US"
    }
  };

  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          // 这里的 FontAwesome 用于你页面中的各种小图标
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        {/* 插入 JSON-LD 脚本 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="m-0 p-0 bg-black text-white min-h-screen flex flex-col">
        <SupabaseProvider>
          <PayPalProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />

            <CartDrawer />

            <Toaster 
              position="bottom-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '12px',
                  borderRadius: '0px',
                  border: '1px solid #333'
                },
              }} 
            />
            
          </PayPalProvider>
        </SupabaseProvider>

        <Script id="tawkto-script" strategy="afterInteractive">
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

        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
      </body>
    </html>
  );
}