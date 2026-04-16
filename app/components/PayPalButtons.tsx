"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

export default function PayPalPaymentButton({ cart, address }: any) {
  const router = useRouter();

  return (
    <PayPalButtons
      style={{ layout: "vertical", color: "black", shape: "rect" }}

      // ✅ 创建订单（调用你的 API）
      createOrder={async () => {
        const res = await fetch("/api/checkout/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cart, address }),
        });

        const data = await res.json();

        if (data.id) {
          return data.id; // PayPal Order ID
        }

        throw new Error(data.error || "Create order failed");
      }}

      // ✅ 用户付款后
      onApprove={async (data) => {
        // 👉 只跳转，不做任何业务逻辑
        router.push(`/checkout/success?token=${data.orderID}`);
      }}

      onError={(err) => {
        console.error("PayPal Error:", err);
        alert("Payment failed, please try again.");
      }}
    />
  );
}