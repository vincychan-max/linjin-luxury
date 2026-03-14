"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // 如果没有 ID，只记录警告，不要中断页面渲染（防止 500 错误）
  if (!clientId) {
    if (typeof window !== "undefined") {
      console.warn("PayPal Client ID 缺失，请检查 .env.local 文件");
    }
    return <>{children}</>; 
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId,
        currency: "USD",
        intent: "capture",
        // 建议先去掉 environment 和 debug，用最简配置测试
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}