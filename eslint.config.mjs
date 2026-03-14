import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. 明确定义忽略的文件（代替原来的 globalIgnores）
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**"
    ],
  },
  // 2. 使用兼容模式加载 Next.js 的核心规则
  // 这样可以确保它不会去调用已经废弃的 'extensions' 选项
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // 3. 自定义规则配置（可选）
  {
    rules: {
      // 在这里可以添加你想关掉或修改的规则
    },
  },
];

export default eslintConfig;