import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import PayPalProvider from './components/PayPalProvider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Linjin Luxury',
  description: '永恒优雅的奢侈品天地',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        
        {/* 预加载 Hero 主图，提升首屏加载性能（LCP） */}
        <link rel="preload" as="image" href="/images/hero-main.jpg" />
      </head>
      <body className="m-0 p-0 bg-black text-white min-h-screen flex flex-col">
        <PayPalProvider>
          <Header />
          {/* 移除 main 的 pt-40，让 hero 区能完全到顶（header fixed 覆盖在上） */}
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </PayPalProvider>

        {/* Tawk.to 脚本（保持原样） */}
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


      </body>
    </html>
  );
}