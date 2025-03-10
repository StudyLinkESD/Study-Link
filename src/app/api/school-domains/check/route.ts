import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/school-domains/check:
 *   post:
 *     tags:
 *       - School Domains
 *     summary: Vérifie un domaine d'école
 *     description: Vérifie si un domaine est autorisé et retourne les informations de l'école associée
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckDomainRequest'
 *     responses:
 *       200:
 *         description: Domaine vérifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckDomainResponse'
 *       400:
 *         description: Domaine non fourni
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 *       404:
 *         description: Domaine non reconnu ou école non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 */
export async function POST(request: Request) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Le domaine est requis' }, { status: 400 });
    }

    const schoolDomain = await prisma.authorizedSchoolDomain.findFirst({
      where: {
        domain: domain.toLowerCase(),
      },
      include: {
        schools: {
          take: 1,
        },
      },
    });

    if (!schoolDomain || schoolDomain.schools.length === 0) {
      return NextResponse.json({ error: 'Domaine non reconnu' }, { status: 404 });
    }

    const school = schoolDomain.schools[0];

    return NextResponse.json({
      schoolId: school.id,
      schoolName: school.name,
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du domaine:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du domaine' },
      { status: 500 },
    );
  }
}
