'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// 1. 定义登录校验规则
const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 位'),
})

/**
 * 登录 Action
 */
export async function loginAction(prevState: any, formData: FormData) {
  // 数据校验
  const validated = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // 如果 Zod 校验失败，返回 issues 中的第一条错误
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  try {
    const supabase = await createClient()

    // 执行 Supabase 登录
    const { error } = await supabase.auth.signInWithPassword(validated.data)

    if (error) {
      // 针对常见错误返回中文提示
      if (error.message.includes('Invalid login credentials')) {
        return { error: '邮箱或密码错误' }
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: '请先验证邮箱' }
      }
      return { error: '登录失败: ' + error.message }
    }
  } catch (e) {
    console.error('Login Action Error:', e)
    return { error: '服务器内部错误，请检查配置' }
  }

  // 登录成功后跳转到首页
  redirect('/')
}

/**
 * 退出登录 Action
 * 你可以在头像下拉菜单的退出按钮中引用这个方法
 */
export async function signOutAction() {
  const supabase = await createClient()
  
  // 清除 Supabase 会话
  await supabase.auth.signOut()
  
  // 退出后跳转回登录页面或首页
  redirect('/auth/signin')
}