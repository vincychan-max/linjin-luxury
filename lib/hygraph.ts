import { GraphQLClient } from 'graphql-request';

// 1. 强制防御依然保留，这是对 Token 的保护
if (typeof window !== 'undefined') {
  throw new Error('Security Error: This file (hygraph.ts) can only be used on the server.');
}

// 2. 修改为带前缀的变量名
const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT; 
const token = process.env.HYGRAPH_TOKEN;

if (!endpoint) {
  throw new Error('Missing NEXT_PUBLIC_HYGRAPH_ENDPOINT env variable');
}

export const hygraph = new GraphQLClient(endpoint, {
  headers: {
    // 3. Token 永远不会流向浏览器，因为它没有 NEXT_PUBLIC_ 前缀
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});