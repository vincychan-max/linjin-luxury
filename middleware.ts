import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. 创建一个初始响应
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. 初始化 Supabase 客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          // 更新请求中的 Cookie，确保下游（API 路由等）能拿到最新状态
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // 创建新的响应以同步 Cookie
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // 在响应头中设置 Cookie，写回浏览器
          // 使用 as any 解决 Next.js 15 与 Supabase 类型定义不一致导致的红线问题
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  /**
   * 核心逻辑：调用 getUser()
   * 这不仅能验证用户，还会自动触发 setAll 逻辑来刷新即将过期的 Session。
   * 这解决了日志中关于 getSession() 不安全的警告。
   */
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (浏览器图标)
     * - 所有常见的图片格式
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}