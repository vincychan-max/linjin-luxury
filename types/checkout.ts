// types/checkout.ts
export interface CartItem {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color: string;
  size: string;
}

export interface Address {
  id?: string;
  name: string;
  street: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  is_default?: boolean;
}

// 订单记录用（可选，以后扩展用）
export interface Order {
  id: string;
  user_id: string;
  paypal_order_id: string;
  items: CartItem[];
  address: Address;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: 'paid' | 'processing' | 'shipped' | 'cancelled';
}