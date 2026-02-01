import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

// 将 PrismaClient 实例化移到每个 handler 函数内部
// 这是修复 Turbopack 构建失败（Failed to collect page data）的关键
// 因为顶部全局实例化会在构建分析阶段执行代码，导致崩溃
// 同时建议强制动态渲染（API 路由默认动态，但显式声明更安全）
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return Response.json({ results: [] });
  }

  const prisma = new PrismaClient();
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.email },
      include: { product: true },
    });

    const results = wishlist.map(w => w.product);

    return Response.json({ results });
  } finally {
    await prisma.$disconnect(); // 可选：在 serverless 环境不推荐频繁 disconnect，但这里安全
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { productId } = await request.json();

  const prisma = new PrismaClient();
  try {
    await prisma.wishlist.create({
      data: {
        userId: session.user.email,
        productId,
      },
    });

    return Response.json({ success: true });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { productId } = await request.json();

  const prisma = new PrismaClient();
  try {
    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.email,
        productId,
      },
    });

    return Response.json({ success: true });
  } finally {
    await prisma.$disconnect();
  }
}