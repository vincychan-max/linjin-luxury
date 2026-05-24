// app/[gender]/loading.tsx
export default function Loading() {
  return (
    <main className="w-full min-h-screen bg-white animate-pulse">
      {/* 1. 模拟 Hero Section */}
      <section className="relative w-full h-[60vh] bg-[#f0f0f0] flex flex-col items-center justify-center">
        <div className="w-64 h-10 bg-gray-200 rounded mb-4" />
        <div className="w-48 h-4 bg-gray-200 rounded" />
      </section>

      {/* 2. 模拟导航栏 */}
      <nav className="py-6 border-b border-gray-100">
        <div className="flex justify-center gap-8 px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-16 h-3 bg-gray-200 rounded" />
          ))}
        </div>
      </nav>

      {/* 3. 模拟产品网格 */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="group block">
              <div className="w-full aspect-[3/4] bg-[#f7f7f7] mb-5" />
              <div className="text-center space-y-2">
                <div className="w-3/4 h-3 bg-gray-200 mx-auto rounded" />
                <div className="w-1/4 h-3 bg-gray-100 mx-auto rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}