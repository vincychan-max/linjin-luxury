// types/product.ts

export interface ProductColor {
  id: string;
  name: string;
  images: { url: string }[];
}

export interface ProductCategory {
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string | { html: string };
  material?: string;
  size?: string;
  stock: number;
  colors: ProductColor[];
  gender?: { name: string; slug: string };
  category?: ProductCategory;
  materialsCare?: string;
  altText?: string;
  // 如果还有其他字段，全部补全在这里
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number; // 商业级必须有数量控制
  currency: string; // 商业级必须有货币单位
}