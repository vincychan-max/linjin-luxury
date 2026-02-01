'use client';

interface ProductInfoProps {
  product: any;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-12">
      {/* 产品描述 */}
      <div>
        <h2 className="text-3xl uppercase tracking-widest mb-8">Product Description</h2>
        <p className="text-xl leading-relaxed max-w-2xl">{product.description}</p>
      </div>

      {/* 折叠详情区 */}
      <div className="space-y-0 divide-y divide-gray-300">
        <details className="group py-6">
          <summary className="flex justify-between items-center cursor-pointer list-none">
            <h3 className="text-2xl uppercase tracking-widest">Product Details</h3>
            <span className="text-4xl transition group-open:rotate-45">+</span>
          </summary>
          <div className="pt-6 text-xl leading-relaxed space-y-4">
            {/* 修复：dimensions 是对象，不能直接渲染，改成遍历显示 */}
            {product.dimensions && Object.keys(product.dimensions).length > 0 && (
              <div>
                <span className="uppercase tracking-widest">Dimensions:</span>
                <ul className="ml-8 mt-2 space-y-1">
                  {Object.entries(product.dimensions as Record<string, unknown>).map(([key, value]) => (
                    <li key={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}: {String(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* features 是数组，保持不变（假设是字符串数组） */}
            {product.features && product.features.length > 0 && (
              <ul className="space-y-4">
                {product.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-6 text-2xl">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>

        <details className="group py-6">
          <summary className="flex justify-between items-center cursor-pointer list-none">
            <h3 className="text-2xl uppercase tracking-widest">Materials & Care</h3>
            <span className="text-4xl transition group-open:rotate-45">+</span>
          </summary>
          <div className="pt-6 text-xl leading-relaxed">
            <p>Made with premium authentic materials. Care instructions: Store in dust bag, avoid direct sunlight, clean with soft dry cloth.</p>
          </div>
        </details>

        <details className="group py-6">
          <summary className="flex justify-between items-center cursor-pointer list-none">
            <h3 className="text-2xl uppercase tracking-widest">Our Commitment</h3>
            <span className="text-4xl transition group-open:rotate-45">+</span>
          </summary>
          <div className="pt-6 text-xl leading-relaxed">
            <p>At Linjin Luxury in Los Angeles, we guarantee authenticity for all new premium luxury handbags. Complimentary express shipping, exchanges & returns, secure payments, and signature packaging.</p>
          </div>
        </details>
      </div>
    </div>
  );
}