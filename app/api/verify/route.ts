import { NextResponse } from 'next/server';
import { hygraph } from '@/lib/hygraph';
import { gql } from 'graphql-request';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim();

  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  // 1. 查询逻辑 (保持适配 Variants 架构)
  const query = gql`
    query GetProductForVerification($code: String!) {
      products(where: { serialNumber: $code }) {
        id
        name
        serialNumber
        verifyCount # 读取当前的验证次数
        variants(first: 1) {
          ... on ProductVariant {
            images(first: 1) { url }
          }
        }
      }
    }
  `;

  // 2. 递增逻辑 (Mutation)
  const incrementMutation = gql`
    mutation IncrementVerifyCount($id: ID!, $nextCount: Int!) {
      updateProduct(
        where: { id: $id }
        data: { verifyCount: $nextCount }
      ) {
        id
        verifyCount
      }
      # 记得发布更改，否则下次查询到的还是旧数据
      publishProduct(where: { id: $id }, to: [PUBLISHED]) {
        id
      }
    }
  `;

  try {
    const data: any = await hygraph.request(query, { code });

    if (data.products && data.products.length > 0) {
      const p = data.products[0];
      const currentCount = p.verifyCount || 0;
      const nextCount = currentCount + 1;

      // 🌟 核心：异步触发更新，不阻塞主流程返回
      // 也可以用 await 确保更新成功后再返回
      try {
        await hygraph.request(incrementMutation, { 
          id: p.id, 
          nextCount: nextCount 
        });
      } catch (mutationError) {
        console.error('Mutation Update Failed:', mutationError);
        // 更新失败不影响告知客户这是正品，所以只记录日志
      }

      return NextResponse.json({ 
        verified: true, 
        product: {
          name: p.name,
          serialNumber: p.serialNumber,
          image: p.variants?.[0]?.images?.[0]?.url || null,
          verifyCount: nextCount, // 返回增加后的次数
          status: nextCount > 10 ? 'WARNING' : 'SECURE' // 如果被查次数过多，给前端一个警告信号
        }
      });
    }

    return NextResponse.json({ verified: false }, { status: 200 });
  } catch (error: any) {
    console.error('Verification System Error:', error);
    return NextResponse.json({ error: 'System error' }, { status: 500 });
  }
}