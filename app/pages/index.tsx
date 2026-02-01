import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linjin Luxury | Authentic New Premium Handbags in Los Angeles',
  description: 'Discover authentic new luxury handbags in pristine condition from Linjin Luxury, based in Los Angeles.',
};

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Linjin Luxury 网站上线成功！🚀</h1>
      <p style={{ fontSize: '28px' }}>如果看到这句，部署正常了（Pages Router 测试页）。</p>
      <p style={{ fontSize: '24px', marginTop: '40px' }}>现在可以逐步恢复 app/page.tsx 的正式代码。</p>
      <img src="/images/hero-main.jpg" alt="Hero" style={{ maxWidth: '80%', marginTop: '40px' }} />
    </main>
  );
}