// lib/pricing.ts
import { 
  BASE_SHIPPING_RATES, 
  STATE_TAX_RATES, 
  SOUTH_AMERICA_TAX_RATES, 
  EUROPE_VAT_RATES,
  getRegion 
} from '@/constants/shipping';

/**
 * 统一计算订单金额
 * @param countryCode - 必须是 ISO 2位代码 (例如 'US', 'BR')
 * @param state - 州/省代码
 */
export const calculateTotals = (
  subtotal: number, 
  itemsCount: number, 
  countryCode: string, 
  state: string
) => {
  // 1. 强制标准化输入
  const country = countryCode.toUpperCase();
  const stateCode = state.toUpperCase();

  // 2. 查找运费：使用 shipping.ts 中的常量与逻辑
  const baseRate = BASE_SHIPPING_RATES[country] ?? BASE_SHIPPING_RATES['DEFAULT'] ?? 60;
  const shipping = baseRate + (itemsCount > 0 ? (itemsCount - 1) * 20 : 0);

  // 3. 计算税率：根据区域进行智能分流
  const region = getRegion(country); // 使用 shipping.ts 封装好的区域判断逻辑
  let taxRate = 0;

  switch (region) {
    case 'US':
      taxRate = STATE_TAX_RATES[stateCode] ?? STATE_TAX_RATES['DEFAULT'] ?? 0.08;
      break;
    case 'SOUTH_AMERICA':
      taxRate = SOUTH_AMERICA_TAX_RATES[country] ?? SOUTH_AMERICA_TAX_RATES['DEFAULT'] ?? 0;
      break;
    case 'EUROPE':
      taxRate = EUROPE_VAT_RATES[country] ?? EUROPE_VAT_RATES['DEFAULT'] ?? 0.20;
      break;
    default:
      // 其他国家目前默认税率为 0
      taxRate = 0;
      break;
  }

  const tax = subtotal * taxRate;

  // 4. 返回完整结构
  return {
    subtotal: Number(subtotal.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number((subtotal + shipping + tax).toFixed(2))
  };
};