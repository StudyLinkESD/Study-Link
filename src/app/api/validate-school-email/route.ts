import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "L'email est requis" }, { status: 400 });
    }

    const domain = email.split('@')[1];

    if (!domain) {
      return NextResponse.json({ error: "Format d'email invalide" }, { status: 400 });
    }

    const school = await prisma.school.findFirst({
      where: {
        domain: {
          domain: domain,
        },
      },
    });

    if (!school) {
      return NextResponse.json(
        { error: "L'email scolaire doit correspondre à une école enregistrée" },
        { status: 400 },
      );
    }

    return NextResponse.json({ isValid: true });
  } catch (error) {
    console.error("Erreur lors de la validation de l'email:", error);
    return NextResponse.json({ error: "Erreur lors de la validation de l'email" }, { status: 500 });
  }
}
