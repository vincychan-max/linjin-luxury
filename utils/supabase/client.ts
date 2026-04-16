import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 这会创建一个可以在浏览器（Client Component）中使用的 Supabase 客户端
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}