// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 创建支持服务端渲染 (SSR) 的 Supabase 客户端
 * 适配 Next.js 15 的异步 cookies 调用方式
 */
export async function createClient() {
  const cookieStore = await cookies() // 在 Next.js 15 中，这里必须使用 await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // 在服务端组件 (Server Components) 中调用 set 是为了在 Middleware 中同步状态
            // 如果在普通的 page.tsx 中触发，try-catch 会静默处理以防报错
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // 正常现象：Server Component 无法直接通过这种方式写入 Cookie
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // 正常现象
          }
        },
      },
    }
  )
}