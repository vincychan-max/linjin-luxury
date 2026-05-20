"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { capturePayPalOrder } from "@/lib/actions/checkout";

interface PayPalButtonProps {
  cart: any[];
  address: any;
  userId?: string; // 💡 注入 userId，方便后续完美闭环清空购物车
}

export default function PayPalPaymentButton({ cart, address, userId }: PayPalButtonProps) {
  const router = useRouter();

  // 💡 【核心修复】移除 Date.now()！只有当商品数量或国家发生实质改变时才刷新组件。
  // 这样保证了用户在点击按钮、发起请求的这几秒钟内，按钮的 key 是绝对稳定的，绝不会被中途销毁！
  const buttonKey = `paypal-btn-${cart?.length || 0}-${address?.country || 'init'}`;

  return (
    <PayPalButtons
      key={buttonKey} // 🚨 保持稳定的生命周期 Key
      style={{ layout: "vertical", color: "black", shape: "rect" }}

      // ✅ 1. 创建订单
      createOrder={async () => {
        try {
          console.log("🚀 [Frontend Click] 用户触发了支付按钮，正在请求 API 路由...");
          
          const res = await fetch("/api/checkout/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              items: cart, 
              address,
              userId: userId || null // 顺手把 userId 捎带给后端订单记录
            }),
          });

          const data = await res.json();
          console.log("📥 [Frontend Receive] API 路由响应数据:", data);

          if (res.ok && data.id) {
            console.log("🎯 [Frontend Success] 成功将 Order ID 送回给 PayPal 组件:", data.id);
            return data.id; // 返回给组件，正式拉起官方安全付款小窗口
          }

          throw new Error(data.error || "Create order failed");
        } catch (err: any) {
          console.error("❌ 前端创建订单请求失败:", err);
          alert(`Checkout Error: ${err.message}`);
          return "";
        }
      }}

      // ✅ 2. 用户在弹窗里付款成功后触发
      onApprove={async (data) => {
        try {
          console.log("💰 用户已授权，正在请求后端进行真实捕获扣款... 订单 ID:", data.orderID);
          
          // 执行刚才 Action 文件里的扣款和履约
          const captureResult = await capturePayPalOrder(data.orderID);

          if (captureResult.success) {
            console.log("🎉 扣款并安全履约成功！准备跳转到成功页面。");
            router.push(`/checkout/success?order_id=${data.orderID}`);
          } else {
            throw new Error(captureResult.message || "Capture failed");
          }
        } catch (err: any) {
          console.error("❌ 捕获扣款阶段失败:", err);
          alert(`Payment confirmation failed: ${err.message}`);
        }
      }}

      // ❌ 3. 错误处理
      onError={(err) => {
        console.error("💥 PayPal 组件触发内部异常拦截:", err);
        alert("PayPal Sandbox Gateway loaded with warnings. Please refresh or check your merchant app settings.");
      }}
    />
  );
}