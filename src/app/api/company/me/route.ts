import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const companyOwner = await prisma.companyOwner.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        company: true,
      },
    });

    if (!companyOwner) {
      return new NextResponse('Non autorisé - Accès entreprise uniquement', {
        status: 403,
      });
    }

    return NextResponse.json(companyOwner);
  } catch (error) {
    console.error('[COMPANY_ME]', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}
