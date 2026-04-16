// app/cart/page.tsx
import { createClient } from '@/utils/supabase/server';
import ClientCartPage from './ClientCartPage';

export default async function CartPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  let initialCart: any[] = [];

  if (user?.id) {
    const { data: cartData } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    initialCart = cartData || [];
  }

  return (
    <ClientCartPage 
      user={user}
      initialCart={initialCart}
    />
  );
}