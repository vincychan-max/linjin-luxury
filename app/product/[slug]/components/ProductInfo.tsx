'use client';

/**
 * 💡 优化说明：
 * 1. 标题转换：使用 capitalize 类名实现首字母大写，其余小写。
 * 2. 字号下调：标题从 text-2xl 降至 text-xl，价格从 text-xl 降至 text-lg，更加精致。
 * 3. 间距保留：保留了 pt-6 确保英雄区下方有呼吸感。
 */

interface ProductInfoProps {
  product: {
    name: string;
    price: number;
    description?: string | { html: string };
  };
}

export default function ProductInfo({ product }: ProductInfoProps) {
  if (!product) return null;

  // 安全提取描述内容
  let descriptionHtml = 'No description available.';
  if (product.description) {
    if (typeof product.description === 'object' && product.description.html) {
      descriptionHtml = product.description.html; 
    } else if (typeof product.description === 'string') {
      descriptionHtml = product.description; 
    }
  }

  return (
    <div className="flex flex-col space-y-6 pt-6 lg:pt-2">
      {/* 标题与价格区域 */}
      <div className="space-y-2">
        {/* 🚀 修改点：
           - text-xl: 缩小标题字号
           - capitalize: 实现首字母大写（注意：如果原始数据是全大写，需配合 lowercase）
           - tracking-[0.1em]: 稍微收紧字间距，配合小写字母更协调
        */}
        <h1 className="text-xl font-medium lowercase capitalize tracking-[0.1em] leading-tight text-zinc-900">
          {product.name}
        </h1>
        
        {/* 🚀 修改点：text-lg 缩小价格字号 */}
        <p className="text-lg font-light tracking-[0.05em] text-zinc-800">
          USD {product.price?.toLocaleString()}
        </p>
      </div>

      {/* 极简分割线 */}
      <div className="h-px bg-gray-100 w-full" />

      {/* 产品详情描述区域 */}
      <div className="mt-4">
        <div
          className="text-[13px] leading-relaxed max-w-2xl prose prose-zinc font-light text-zinc-500 
                     prose-p:mb-4 prose-p:last:mb-0"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </div>
    </div>
  );
}