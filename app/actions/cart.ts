// app/actions/cart.ts
'use server'
import { createClient } from '@/utils/supabase/server';

export async function updateShippingAddress(data: any) {
  // 必须加上 await
  const supabase = await createClient(); 
  
  // 现在 supabase 已经是正确的客户端实例了，下面的代码就不会报错了
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");

  const { data: result, error } = await supabase
    .from('addresses')
    .upsert({ ...data, user_id: user.id })
    .select()
    .single();
    
  if (error) throw error;
  return result;
}