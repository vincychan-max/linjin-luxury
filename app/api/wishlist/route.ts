import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) return Response.json({ results: [] });

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.email },
    include: { product: true },
  });

  const results = wishlist.map(w => w.product);

  return Response.json({ results });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 });

  const { productId } = await request.json();

  await prisma.wishlist.create({
    data: {
      userId: session.user.email,
      productId,
    },
  });

  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 });

  const { productId } = await request.json();

  await prisma.wishlist.deleteMany({
    where: {
      userId: session.user.email,
      productId,
    },
  });

  return Response.json({ success: true });
}