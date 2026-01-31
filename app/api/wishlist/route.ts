import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ results: [] });

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  const results = wishlist.map(w => w.product);

  return Response.json({ results });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const { productId } = await request.json();

  await prisma.wishlist.create({
    data: {
      userId: session.user.id,
      productId,
    },
  });

  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const { productId } = await request.json();

  await prisma.wishlist.deleteMany({
    where: {
      userId: session.user.id,
      productId,
    },
  });

  return Response.json({ success: true });
}