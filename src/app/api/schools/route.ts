import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateSchoolData } from '@/utils/validation/school.validation';

import { SchoolResponseDTO } from '@/dto/school.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/schools:
 *   get:
 *     tags:
 *       - Schools
 *     summary: Récupère la liste des écoles
 *     description: Retourne toutes les écoles actives avec leurs informations de domaine
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtre les écoles par leur état d'activation
 *     responses:
 *       200:
 *         description: Liste des écoles récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchoolResponseDTO'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolError'
 */
export async function GET(
  request: Request,
): Promise<NextResponse<SchoolResponseDTO[] | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where = {
      deletedAt: null,
      ...(isActive !== null ? { isActive: isActive === 'true' } : {}),
    };

    const schools = await prisma.school.findMany({
      where,
      include: {
        domain: true,
      },
    });

    return NextResponse.json(schools);
  } catch (error) {
    console.error('Erreur lors de la récupération des écoles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des écoles' },
      { status: 500 },
    );
  }
}

interface CreateSchoolDTO {
  name: string;
  domainId: string;
  logo?: string | null;
  owner: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

/**
 * @swagger
 * /api/schools:
 *   post:
 *     tags:
 *       - Schools
 *     summary: Crée une nouvelle école
 *     description: Crée une nouvelle école avec son propriétaire
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolRequest'
 *     responses:
 *       200:
 *         description: École créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: "ID de l'école créée"
 *       400:
 *         description: Données invalides ou domaine non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolError'
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
 *               $ref: '#/components/schemas/SchoolError'
 */
export async function POST(
  request: Request,
): Promise<NextResponse<{ id: string } | { error: string; details?: Record<string, string> }>> {
  try {
    const body = (await request.json()) as CreateSchoolDTO;

    const validationResult = await validateSchoolData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const existingDomain = await prisma.authorizedSchoolDomain.findUnique({
      where: { id: body.domainId },
    });

    if (!existingDomain) {
      return NextResponse.json({ error: "Le domaine spécifié n'existe pas" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: body.owner.email,
          firstName: body.owner.firstName,
          lastName: body.owner.lastName,
          type: 'school_owner',
        },
      });

      const school = await tx.school.create({
        data: {
          name: body.name,
          logo: body.logo,
          domainId: body.domainId,
        },
      });

      await tx.schoolOwner.create({
        data: {
          userId: user.id,
          schoolId: school.id,
        },
      });

      return school;
    });

    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error("Erreur lors de la création de l'école:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'école" }, { status: 500 });
  }
}
