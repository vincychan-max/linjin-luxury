import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import PayPalProvider from './components/PayPalProvider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Linjin Luxury | Authentic Pristine Designer Handbags Los Angeles',
    template: '%s | Linjin Luxury',
  },
  description: 'Authentic new premium luxury handbags in pristine condition from Los Angeles. 100% guaranteed authenticity and exceptional quality.',
  keywords: 'Linjin Luxury, luxury handbags Los Angeles, authentic designer bags, pristine condition handbags, Hermes Birkin Los Angeles, Chanel classic flap, Louis Vuitton',
  metadataBase: new URL('https://www.linjinluxury.com'),
  openGraph: {
    title: 'Linjin Luxury | Authentic Pristine Designer Handbags Los Angeles',
    description: 'Premium authentic new designer handbags in pristine condition from Los Angeles.',
    images: [
      {
        url: '/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'Linjin Luxury Hero',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linjin Luxury | Authentic Luxury Handbags Los Angeles',
    description: 'Premium authentic new designer handbags in pristine condition from Los Angeles.',
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
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        
        {/* 预加载 Hero 主图，提升 LCP */}
        <link rel="preload" as="image" href="/images/hero-main.jpg" />

        {/* 预加载关键字体（如果有自定义字体，可加） */}
        {/* <link rel="preload" as="style" href="/fonts/your-font.css" /> */}

        {/* Favicon（建议加） */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="m-0 p-0 bg-black text-white min-h-screen flex flex-col">
        <PayPalProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </PayPalProvider>

        {/* Tawk.to 客服脚本 */}
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