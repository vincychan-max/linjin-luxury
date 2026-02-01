import Image from 'next/image';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', textAlign: 'center', padding: '40px' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>Linjin Luxury 上线成功！🎉🚀</h1>
      <p style={{ fontSize: '28px' }}>Pages Router 测试首页加载正常。</p>
      <div style={{ marginTop: '60px', position: 'relative', width: '80%', maxWidth: '1200px', height: '600px' }}>
        <Image
          src="/images/hero-main.jpg"
          alt="Hero"
          fill
          priority
        />
      </div>
    </main>
  );
}