import { NextResponse } from 'next/server';
import { hygraph } from '@/lib/hygraph';
import { gql } from 'graphql-request';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mainCategory = searchParams.get('mainCategory');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '12');
  const after = searchParams.get('after') || null;

  if (!mainCategory || !category) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // 核心修复：将 products 改为 productsConnection
  const query = gql`
    query GetMoreProducts($mainCategory: String!, $category: String!, $limit: Int!, $after: String) {
      productsConnection(
        first: $limit
        after: $after
        orderBy: createdAt_DESC
        stage: PUBLISHED
        where: {
          subCategories_some: {
            slug: $category
            category: { gender: { slug: $mainCategory } }
          }
        }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            name
            slug
            price
            compareAtPrice
            featured
            isNew
            createdAt
            images(first: 6) {
              url
            }
            colors {
              ... on ProductColor {
                hexColor {
                  hex
                }
                name
                images(first: 6) {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data: any = await hygraph.request(query, { 
      mainCategory, 
      category, 
      limit, 
      after 
    });

    // 格式化返回数据，使前端逻辑不需要大改
    return NextResponse.json({
      pageInfo: data.productsConnection.pageInfo,
      nodes: data.productsConnection.edges.map((edge: any) => edge.node)
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Failed to fetch', details: error.message }, { status: 500 });
  }
}