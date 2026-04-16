import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 建议使用更深邃的色值
        black: "#111111",
        background: "var(--background)",
        foreground: "var(--foreground)",
        studio: {
          light: "#FAFAFA",
          dark: "#1A1A1A",
          muted: "#737373",
        }
      },
      fontFamily: {
        // 确保你的 layout.tsx 中引用了对应的字体变量
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
        serif: ["var(--font-geist-serif)", "Didot", "serif"],
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1.05) translate(0px, 0px)' },
          '50%': { transform: 'scale(1.15) translate(-1%, -1%)' },
          '100%': { transform: 'scale(1.05) translate(0px, 0px)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        kenburns: 'kenburns 24s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        reveal: 'reveal 1.5s cubic-bezier(0.19, 1, 0.22, 1) forwards',
      },
      letterSpacing: {
        // 奢侈品牌喜欢极宽的字间距
        'extrawide': '0.3em',
        'archive': '0.6em',
      }
    },
  },
  plugins: [],
};

export default config;