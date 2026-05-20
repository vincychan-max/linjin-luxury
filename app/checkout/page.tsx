"use client";

import { useEffect, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import PayPalProvider from "../components/PayPalProvider";
import { capturePayPalOrder } from "@/lib/actions/checkout"; // 🚨 只保留捕获款项的 action，用于付款后清空购物车和更新状态

export default function CheckoutPage() {
  const router = useRouter();
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  // 1. 在组件挂载时，从 sessionStorage 读取或生成唯一的 idempotencyKey
  useEffect(() => {
    let key = sessionStorage.getItem("checkout_idempotency_key");
    if (!key) {
      key = crypto.randomUUID();
      sessionStorage.setItem("checkout_idempotency_key", key);
    }
    setIdempotencyKey(key);
  }, []);

  // 模拟数据 (这里为你精准对齐了你购物车里的真实商品信息，保证数据库能平稳对接)
  const cartItems = [
    { 
      product_id: "cmofrx1ambjnj07ln834s4a6k", // 🚨 精准匹配：医生包的商品 ID
      name: "LINJIN Luxury Togo Leather Doctor Bag - Handcrafted Minimalist Shoulder Bag & Crossbody", 
      price: 1250.0, 
      quantity: 1 
    }
  ];
  
  const orderData = {
    shippingAddress: {
      name: "Guest User",
      street: "123 Luxury Ave",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "US"
    }
  };

  // 💡 稳定生命周期 Key：移除 Date.now()，只有商品变动或国家改变才刷新。
  // 确保在点击按钮请求后端的两秒内，按钮绝对不会被意外销毁导致弹窗出不来。
  const buttonKey = `paypal-btn-${cartItems.length}-${orderData.shippingAddress.country}`;

  return (
    <PayPalProvider>
      <div className="min-h-screen bg-white pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-[450px] w-full">
          <div className="text-center mb-16">
            <h1 className="text-2xl uppercase tracking-[15px] font-light mb-4">Checkout</h1>
            <p className="text-[10px] uppercase tracking-[3px] text-zinc-400">Secure Payment</p>
          </div>

          <div className="space-y-6">
            <PayPalButtons
              key={buttonKey} // 🚨 注入生命周期 Key，彻底解决官方 SDK 偶尔死锁或不刷新的 Bug
              style={{ layout: "vertical", color: "black", shape: "pill", label: "pay" }}
              
              // ✅ 1. 创建订单（全面重构：由 Server Action 改为完美收容的 API 路由）
              createOrder={async () => {
                if (!idempotencyKey) {
                  alert("Initializing payment session...");
                  return "";
                }

                try {
                  console.log("🚀 [Frontend Click] 用户触发了支付按钮，正在请求 API 路由...");
                  
                  const res = await fetch("/api/checkout/create-order", {
                    method: "POST",
                    headers: { 
                      "Content-Type": "application/json",
                      "x-idempotency-key": idempotencyKey // 携带好你的幂等键给后端
                    },
                    body: JSON.stringify({ 
                      items: cartItems, 
                      address: orderData.shippingAddress
                    }),
                  });

                  const data = await res.json();
                  console.log("📥 [Frontend Receive] API 路由响应数据:", data);

                  if (res.ok && data.id) {
                    console.log("🎯 [Frontend Success] 成功将 Order ID 送回给 PayPal 组件:", data.id);
                    return data.id; // 返回给组件，拉起官方安全付款小窗口
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
                  
                  // 4. 下单成功，清理 key
                  sessionStorage.removeItem("checkout_idempotency_key");

                  // 触发 Action 进行最终履约捕获
                  const captureResult = await capturePayPalOrder(data.orderID);

                  if (captureResult.success) {
                    console.log("🎉 扣款并安全履约成功！准备跳转。");
                    router.push(`/checkout/success?orderId=${orderData.shippingAddress.name}&token=${data.orderID}`);
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
                alert("PayPal Gateway loaded with warnings. Please try again or check your sandbox buyers account.");
              }}
            />
          </div>
        </div>
      </div>
    </PayPalProvider>
  );
}