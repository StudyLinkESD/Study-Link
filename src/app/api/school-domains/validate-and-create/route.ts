import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

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

    // Vérifier si le domaine existe déjà
    let schoolDomain = await prisma.authorizedSchoolDomain.findFirst({
      where: {
        domain: domain.toLowerCase(),
      },
    });

    // Si le domaine n'existe pas, le créer
    if (!schoolDomain) {
      schoolDomain = await prisma.authorizedSchoolDomain.create({
        data: {
          domain: domain.toLowerCase(),
        },
      });

      // Créer une école par défaut pour ce domaine
      await prisma.school.create({
        data: {
          name: domain.split('.')[0].toUpperCase(), // Nom temporaire basé sur le domaine
          domainId: schoolDomain.id,
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      domain: schoolDomain,
      message: 'Le domaine a été validé et créé si nécessaire',
    });
  } catch (error) {
    console.error('Erreur lors de la validation/création du domaine:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la validation du domaine' },
      { status: 500 },
    );
  }
}
