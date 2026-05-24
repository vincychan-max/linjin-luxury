import { GraphQLClient } from 'graphql-request';
import pLimit from 'p-limit';

/**
 * 安全检查：确保仅在服务端运行
 */
if (typeof window !== 'undefined') {
  throw new Error('Security Error: This file can only be used on the server.');
}

// 1. 读取环境变量 (注意：去掉了 NEXT_PUBLIC_ 前缀)
const endpoint = process.env.HYGRAPH_ENDPOINT;
const token = process.env.HYGRAPH_ASSET_TOKEN || process.env.HYGRAPH_TOKEN;

// 2. 验证 Endpoint 是否存在
if (!endpoint) {
  throw new Error(
    '🔥 错误: 丢失 HYGRAPH_ENDPOINT 环境变量。\n' +
    '请检查项目根目录下的 .env.local 文件，确保没有 NEXT_PUBLIC_ 前缀，并重启开发服务。'
  );
}

/**
 * 3. 全局限流器
 * 防止达到 Hygraph Hobby 计划的并发限制
 */
const limit = pLimit(3);

/**
 * 4. 实例化 GraphQL 客户端
 */
const client = new GraphQLClient(endpoint, {
  headers: {
    ...(token && { Authorization: `Bearer ${token.trim()}` }),
  },
});

/**
 * 5. 核心请求函数 (统一对外输出)
 * 在 page.tsx 或其他 Server Components 中调用此函数
 */
export async function fetchFromHygraph<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  return limit(async () => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // 使用实例化好的 client 执行请求
        const result = await client.request<T>(query, variables);
        return result;
      } catch (error: any) {
        lastError = error;

        // 识别限流错误
        const isRateLimited = 
          error?.response?.status === 429 || 
          error?.message?.includes('429') ||
          error?.message?.toLowerCase().includes('too many requests');

        if (isRateLimited && attempt < 3) {
          const delay = attempt * 1500; 
          console.warn(`⚠️ [Hygraph] 请求受限，正在进行第 ${attempt} 次重试... (等待 ${delay}ms)`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        console.error('❌ [Hygraph Request Error]:', error?.message || error);
        throw error;
      }
    }

    throw lastError || new Error('Hygraph request failed after all retries.');
  });
}