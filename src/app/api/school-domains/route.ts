import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateSchoolDomainData } from '@/utils/validation/school-domain.validation';

import { CreateSchoolDomainDTO, SchoolDomainResponseDTO } from '@/dto/school-domain.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/school-domains:
 *   get:
 *     tags:
 *       - School Domains
 *     summary: Récupère la liste des domaines d'écoles
 *     description: Retourne tous les domaines d'écoles autorisés
 *     responses:
 *       200:
 *         description: Liste des domaines récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchoolDomainResponseDTO'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 */
export async function GET(): Promise<NextResponse<SchoolDomainResponseDTO[] | { error: string }>> {
  try {
    const domains = await prisma.authorizedSchoolDomain.findMany();
    return NextResponse.json(domains);
  } catch (error) {
    console.error('Erreur lors de la récupération des domaines:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des domaines' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/school-domains:
 *   post:
 *     tags:
 *       - School Domains
 *     summary: Crée un nouveau domaine d'école
 *     description: Permet d'ajouter un nouveau domaine d'école autorisé
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolDomainRequest'
 *     responses:
 *       201:
 *         description: Domaine créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainResponseDTO'
 *       400:
 *         description: Données invalides ou domaine déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Accès non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainError'
 */
export async function POST(
  request: Request,
): Promise<
  NextResponse<
    SchoolDomainResponseDTO | { error: string; details?: Record<string, string>; code?: string }
  >
> {
  try {
    const body = (await request.json()) as CreateSchoolDomainDTO;

    const validationResult = await validateSchoolDomainData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: validationResult.errors?.domain || 'Données invalides',
          details: validationResult.errors,
          code: validationResult.errorCode,
        },
        { status: 400 },
      );
    }

    const domain = await prisma.authorizedSchoolDomain.create({
      data: {
        domain: body.domain,
      },
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du domaine:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du domaine' }, { status: 500 });
  }
}
