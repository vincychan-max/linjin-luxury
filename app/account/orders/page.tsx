'use client'

import { supabase } from '@/lib/supabase'  // 你的路径
import { useState, useEffect } from 'react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchOrders(user.id)
    })
  }, [])

  const fetchOrders = async (userId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })  // 最新订单在上

    if (error) console.error(error)
    else setOrders(data || [])
    setLoading(false)
  }

  if (!user) return <p className="text-center py-20 text-3xl">请登录查看订单历史</p>

  if (loading) return <p className="text-center py-20 text-3xl">加载中...</p>

  return (
    <div className="min-h-screen bg-gray-100 pt-32 px-12">
      <h1 className="text-5xl font-thin tracking-widest mb-16 text-center">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-3xl opacity-60">暂无订单</p>
      ) : (
        <div className="max-w-6xl mx-auto">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-12 mb-8 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <p className="text-2xl">订单 ID: {order.id}</p>
                <p className="text-xl text-yellow-400">状态: {order.status || 'pending'}</p>
              </div>
              <p className="text-3xl text-yellow-400 mb-4">总价: ${order.total_price}</p>
              <p className="text-lg opacity-60">下单时间: {new Date(order.created_at).toLocaleString()}</p>
              {/* 可加订单详情 join order_items */}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}