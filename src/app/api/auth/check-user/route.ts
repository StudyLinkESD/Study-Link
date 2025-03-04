import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'L\'email est requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return Response.json({ exists: !!user });
  } catch (error) {
    return Response.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
