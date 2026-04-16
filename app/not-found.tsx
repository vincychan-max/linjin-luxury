import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <h2 className="mb-4 text-xs font-light tracking-[0.3em] text-gray-500 uppercase">
          404 — Not Found
        </h2>
        <h1 className="mb-8 text-2xl font-light tracking-widest text-black uppercase leading-relaxed">
          The piece you are looking for <br /> is unavailable.
        </h1>
        <p className="mb-12 text-sm font-light leading-relaxed text-gray-400">
          Our creations are often limited or unique. <br />
          We invite you to discover our latest arrivals at the atelier.
        </p>
        <Link 
          href="/" 
          className="inline-block border border-black bg-black px-12 py-4 text-xs font-light tracking-widest text-white transition-all hover:bg-transparent hover:text-black"
        >
          DISCOVER THE COLLECTION
        </Link>
      </div>
    </main>
  )
}