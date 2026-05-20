// lib/validations/address.ts
import { z } from 'zod';
import { COUNTRY_CODE_MAP } from '@/constants/shipping';

// 从映射表中提取所有合法的 ISO 代码，并将其转化为 Zod 所需的数组格式
const validCountryCodes = Object.keys(COUNTRY_CODE_MAP) as [string, ...string[]];

export const AddressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  street: z.string().min(5, "Street address is too short"),
  city: z.string().min(2, "City name is too short"),
  state: z.string().min(2, "State/Province is required"),
  zip: z.string().min(3, "Zip code is required"),
  
  // 核心升级：使用 enum 严格限制输入，只允许 COUNTRY_CODE_MAP 中定义的 Key
  country: z.enum(validCountryCodes, {
    errorMap: () => ({ message: "Please select a valid country" }),
  }),
});

export type AddressFormValues = z.infer<typeof AddressSchema>;