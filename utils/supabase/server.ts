import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 创建服务端 Supabase 客户端 (Next.js 15 规范版)
 * 1. 严格 await cookies() 以适配 Next.js 15 异步要求
 * 2. 使用 getAll/setAll 替代旧版 get/set 接口
 * 3. 妥善处理 Server Action / Route 中的 Cookie 写入限制
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 获取所有 Cookie
        getAll() {
          return cookieStore.getAll();
        },
        // 批量设置 Cookie
        // 注意：在 Server Components 中调用此方法会因为 Next.js 限制而抛错，
        // 我们通过 try-catch 静默处理，实际写入通常由 middleware 完成。
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // 这里的错误通常是因为在只读环境下尝试写入 Cookie，可以安全忽略
          }
        },
      },
    }
  );
}