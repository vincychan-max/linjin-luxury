// limited/[id]/page.tsx
'use client';

import ProductClient from './ProductClient';

export default function LimitedProductPage({ params }: { params: { id: string } }) {
  return <ProductClient productId={params.id} />;
}