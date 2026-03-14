import { dirname } from "path";
import { fileURLToPath } from "url";
// 核心修复：显式指向 .cjs 路径，解决 ESM 环境下的导入失败问题
import { FlatCompat } from "@eslint/eslintrc/dist/eslintrc.cjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. 设置全局忽略目录
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "next-env.d.ts"
    ],
  },
  // 2. 使用兼容模式加载 Next.js 规则
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // 3. 针对 Next.js 15 的补充规则（可选，保持环境整洁）
  {
    rules: {
      // 如果你觉得某些警告太烦人，可以在这里关闭
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;