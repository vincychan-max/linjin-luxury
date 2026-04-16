// lib/hygraph.ts
import { GraphQLClient } from 'graphql-request';
import pLimit from 'p-limit';

/**
 * 安全检查：防止在浏览器端执行
 * 确保 API Token 不会暴露给前端用户
 */
if (typeof window !== 'undefined') {
  throw new Error('Security Error: This file can only be used on the server.');
}

// 1. 读取环境变量
const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
// 优先读取你设置的 ASSET_TOKEN，同时兼容旧版变量名
const token = process.env.HYGRAPH_ASSET_TOKEN || process.env.HYGRAPH_TOKEN;

// 2. 验证 Endpoint 是否存在
if (!endpoint) {
  throw new Error(
    '🔥 错误: 丢失 NEXT_PUBLIC_HYGRAPH_ENDPOINT 环境变量。\n' +
    '请检查项目根目录下的 .env.local 文件是否存在，并且变量名书写正确。'
  );
}

/**
 * 3. 全局限流器 (p-limit)
 * Hygraph 的 Hobby/Free 计划对并发请求有限制。
 * 设置为 3 表示每秒最多处理 3 个请求，有效防止 429 Too Many Requests 错误。
 */
const limit = pLimit(3);

/**
 * 4. 实例化 GraphQL 客户端
 */
export const hygraph = new GraphQLClient(endpoint, {
  headers: {
    ...(token && { Authorization: `Bearer ${token.trim()}` }),
  },
});

/**
 * 5. 带限流 + 指数退避重试机制的请求函数
 * 推荐在 Server Components 中优先使用此函数。
 * * @param query GraphQL 查询语句
 * @param variables 查询所需的变量
 * @returns Promise<T>
 */
export async function fetchFromHygraph<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  return limit(async () => {
    let lastError: any = null;

    // 默认尝试 3 次（1次原始请求 + 2次重试）
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await hygraph.request<T>(query, variables);
        return result;
      } catch (error: any) {
        lastError = error;

        // 识别是否为 429 (频率受限) 或网络超时错误
        const isRateLimited = 
          error?.response?.status === 429 || 
          error?.message?.includes('429') ||
          error?.message?.toLowerCase().includes('too many requests');

        if (isRateLimited && attempt < 3) {
          // 指数退避策略：随着尝试次数增加，等待时间变长 (1.5s, 3s)
          const delay = attempt * 1500; 
          console.warn(`⚠️ [Hygraph] 请求受限，正在进行第 ${attempt} 次重试... (等待 ${delay}ms)`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // 如果是其他类型的错误（如语法错误），直接报错，不再重试
        console.error('❌ [Hygraph Request Error]:', error?.message || error);
        throw error;
      }
    }

    throw lastError || new Error('Hygraph request failed after all retries.');
  });
}