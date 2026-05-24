import { gql } from 'graphql-request';

export const GET_PRODUCTS_BY_GENDER = gql`
  query GetProductsByGender(
    $slug: String!, 
    $first: Int!, 
    $skip: Int!, 
    $search: String, 
    $orderBy: ProductOrderByInput
  ) {
    gender(where: { slug: $slug }) {
      name
      heroImage { url }
      categories { name, slug }
    }

    # 增加了搜索和排序逻辑
    products(
      where: { gender: { slug: $slug }, name_contains: $search }, 
      first: $first, 
      skip: $skip,
      orderBy: $orderBy
    ) {
      id
      name
      slug
      price
      isLimited
      isNew
      variants {
        ... on ProductVariant {
          images(first: 1) { url }
        }
      }
    }

    productsConnection(
      where: { gender: { slug: $slug }, name_contains: $search }
    ) {
      aggregate {
        count
      }
    }
  }
`;