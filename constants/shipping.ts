/**
 * constants/shipping.ts
 * 唯一事实来源 (SSOT)：所有 Key 必须严格遵循 ISO 3166-1 Alpha-2 标准代码
 */

// 1. 国家映射表 (使用 as const 锁定类型，确保类型安全)
export const COUNTRY_CODE_MAP = {
  // 核心市场
  'US': 'United States', 'CA': 'Canada', 'GB': 'United Kingdom', 'FR': 'France',
  'DE': 'Germany', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
  'BR': 'Brazil', 'AR': 'Argentina', 'JP': 'Japan', 'AU': 'Australia',
  // 更多国家
  'BE': 'Belgium', 'CH': 'Switzerland', 'SE': 'Sweden', 'NO': 'Norway',
  'DK': 'Denmark', 'FI': 'Finland', 'IE': 'Ireland', 'PT': 'Portugal',
  'AT': 'Austria', 'GR': 'Greece', 'PL': 'Poland', 'CZ': 'Czech Republic',
  'HU': 'Hungary', 'RO': 'Romania', 'NZ': 'New Zealand', 'SG': 'Singapore',
  'MY': 'Malaysia', 'TH': 'Thailand', 'VN': 'Vietnam', 'ID': 'Indonesia',
  'PH': 'Philippines', 'KR': 'South Korea', 'IN': 'India', 'MX': 'Mexico',
  'CL': 'Chile', 'CO': 'Colombia', 'PE': 'Peru', 'ZA': 'South Africa',
  'AE': 'United Arab Emirates', 'SA': 'Saudi Arabia', 'TR': 'Turkey',
  'IL': 'Israel', 'HK': 'Hong Kong', 'TW': 'Taiwan',
} as const;

// 导出类型
export type CountryCode = keyof typeof COUNTRY_CODE_MAP;

// 2. 基础运费表 (未特殊配置的国家会自动走 DEFAULT)
export const BASE_SHIPPING_RATES: Record<string, number> = {
  'US': 50, 'CA': 50, 'GB': 60, 'FR': 60, 'BR': 95, 'AR': 95,
  'DE': 60, 'IT': 60, 'ES': 60, 'NL': 60, 'JP': 70, 'AU': 75,
  'DEFAULT': 70,
};

// 3. 美国各州税率
export const STATE_TAX_RATES: Record<string, number> = {
  'CA': 0.0875, 'NY': 0.08875, 'TX': 0.0825,
  'DEFAULT': 0.08,
};

// 4. 不同区域的税率配置
export const SOUTH_AMERICA_TAX_RATES: Record<string, number> = {
  'BR': 0.60, 'AR': 0.21,
  'DEFAULT': 0.0,
};

export const EUROPE_VAT_RATES: Record<string, number> = {
  'FR': 0.20, 'DE': 0.19, 'GB': 0.20, 'IT': 0.22, 'ES': 0.21, 'NL': 0.21,
  'BE': 0.21, 'CH': 0.08, 'SE': 0.25, 'NO': 0.25, 'DK': 0.25, 'FI': 0.24,
  'IE': 0.23, 'PT': 0.23, 'AT': 0.20, 'GR': 0.24, 'PL': 0.23, 'CZ': 0.21,
  'HU': 0.27, 'RO': 0.19,
  'DEFAULT': 0.20,
};

// 5. 区域划分映射 (用于 pricing.ts 进行逻辑分流)
export const REGION_MAPPING = {
  SOUTH_AMERICA: ['BR', 'AR', 'CL', 'CO', 'PE'],
  EUROPE: [
    'GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'CH', 'SE', 'NO', 
    'DK', 'FI', 'IE', 'PT', 'AT', 'GR', 'PL', 'CZ', 'HU', 'RO'
  ],
};

// 6. 风控黑名单
export const BANNED_COUNTRIES = new Set([
  'UA', 'RU', 'IL', 'PS', 'SY', 'YE', 'AF', 'IR', 'SD', 'SO',
]);

/**
 * --- 辅助方法 (Encapsulation) ---
 */

// 获取下拉菜单选项
export const COUNTRY_OPTIONS = Object.entries(COUNTRY_CODE_MAP).map(([code, name]) => ({
  code,
  name,
}));

// 检查国家是否被禁运
export const isCountryBanned = (code: string): boolean => {
  return BANNED_COUNTRIES.has(code);
};

// 获取运费
export const getShippingRate = (code: string): number => {
  return BASE_SHIPPING_RATES[code] ?? BASE_SHIPPING_RATES['DEFAULT'];
};

// 获取显示名称
export const getCountryName = (code: string): string => {
  return COUNTRY_CODE_MAP[code as CountryCode] || 'International';
};

// 判断国家所在区域
export const getRegion = (code: string): 'SOUTH_AMERICA' | 'EUROPE' | 'US' | 'OTHER' => {
  if (code === 'US') return 'US';
  if (REGION_MAPPING.SOUTH_AMERICA.includes(code)) return 'SOUTH_AMERICA';
  if (REGION_MAPPING.EUROPE.includes(code)) return 'EUROPE';
  return 'OTHER';
};