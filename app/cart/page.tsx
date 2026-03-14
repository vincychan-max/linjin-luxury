// app/cart/page.tsx (no 'use client')
import { createClient } from '@/utils/supabase/server'; // 你的 Supabase server client
import ClientCartPage from './ClientCartPage'; // 新建客户端组件

// 移动常量到 server（静态数据）
const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.0875, NY: 0.08875, TX: 0.0825, FL: 0.07, IL: 0.0925,
  PA: 0.06, OH: 0.0725, GA: 0.07, NC: 0.0675, NJ: 0.06625,
};

const SOUTH_AMERICA_TAX_RATES: Record<string, number> = {
  'Brazil': 0.60, 'Argentina': 0.21, 'Chile': 0.19, 'Colombia': 0.19, 'Peru': 0.18,
};

const BASE_SHIPPING_RATES: Record<string, number> = {
  'United States': 50, 'Canada': 50, 'United Kingdom': 50, 'France': 50,
  'Germany': 50, 'Italy': 50, 'Spain': 50, 'Japan': 55, 'South Korea': 55,
  'Australia': 55, 'China': 50, 'Singapore': 50, 'Hong Kong': 50,
  'India': 50, 'Indonesia': 50, 'Thailand': 30, 'Vietnam': 30,
  'Malaysia': 30, 'Philippines': 30, 'Brazil': 120, 'Argentina': 120,
  'Chile': 100, 'Colombia': 100, 'Peru': 100,
};

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  let initialCart = [];
  let initialSubtotal = 0;
  let initialFormattedSubtotal = '$0.00'; // server 预格式化
  let initialShipping = 0;
  let initialFormattedShipping = '$0.00'; // 新增
  let initialTax = 0;
  let initialFormattedTax = '$0.00'; // 新增
  let initialTotal = 0.01;
  let initialFormattedTotal = '$0.01'; // 新增

  if (user) {
    const { data: cartData } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id);

    initialCart = cartData || [];
    initialSubtotal = initialCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // server 预计算所有格式化字符串（用 en-US locale 固定）
    const formatPrice = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    initialFormattedSubtotal = formatPrice(initialSubtotal);
    
    const totalItemsCount = initialCart.reduce((sum, item) => sum + item.quantity, 0);
    initialShipping = totalItemsCount === 0 ? 0 : (BASE_SHIPPING_RATES['United States'] || 60) + (totalItemsCount - 1) * 20; // 假设默认 US
    initialFormattedShipping = formatPrice(initialShipping);
    
    const rate = 0.08; // server 默认税率（US average）；client 会基于地址重算
    initialTax = initialSubtotal * rate;
    initialFormattedTax = formatPrice(initialTax);
    
    initialTotal = Math.max(0.01, initialSubtotal + initialShipping + initialTax);
    initialFormattedTotal = formatPrice(initialTotal);
  }

  return <ClientCartPage 
    initialCart={initialCart} 
    initialSubtotal={initialSubtotal}
    initialFormattedSubtotal={initialFormattedSubtotal}
    initialShipping={initialShipping}
    initialFormattedShipping={initialFormattedShipping}
    initialTax={initialTax}
    initialFormattedTax={initialFormattedTax}
    initialTotal={initialTotal}
    initialFormattedTotal={initialFormattedTotal}
  />;
}