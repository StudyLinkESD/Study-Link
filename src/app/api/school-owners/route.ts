import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateSchoolOwnerData } from '@/utils/validation/school-owner.validation';

import { CreateSchoolOwnerDTO, SchoolOwnerResponseDTO } from '@/dto/school-owner.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/school-owners:
 *   get:
 *     tags:
 *       - School Owners
 *     summary: Récupère la liste des propriétaires d'écoles
 *     description: Retourne tous les propriétaires d'écoles avec leurs informations utilisateur et école
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des propriétaires d'écoles récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchoolOwnerResponseDTO'
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
 *               $ref: '#/components/schemas/SchoolOwnerError'
 */
export async function GET(): Promise<NextResponse<SchoolOwnerResponseDTO[] | { error: string }>> {
  try {
    const schoolOwners = await prisma.schoolOwner.findMany({
      include: {
        user: true,
        school: true,
      },
    });

    return NextResponse.json(schoolOwners);
  } catch (error) {
    console.error("Erreur lors de la récupération des propriétaires d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des propriétaires d'école" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/school-owners:
 *   post:
 *     tags:
 *       - School Owners
 *     summary: Crée un nouveau propriétaire d'école
 *     description: Associe un utilisateur comme propriétaire d'une école
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolOwnerRequest'
 *     responses:
 *       201:
 *         description: Propriétaire d'école créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolOwnerResponseDTO'
 *       400:
 *         description: Données invalides ou utilisateur déjà propriétaire
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolOwnerError'
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
 *       404:
 *         description: Utilisateur ou école non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolOwnerError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolOwnerError'
 */
export async function POST(
  request: Request,
): Promise<
  NextResponse<SchoolOwnerResponseDTO | { error: string; details?: Record<string, string> }>
> {
  try {
    const body = (await request.json()) as CreateSchoolOwnerDTO;

    const validationResult = await validateSchoolOwnerData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const schoolOwner = await prisma.schoolOwner.create({
      data: {
        userId: body.userId,
        schoolId: body.schoolId,
      },
      include: {
        user: true,
        school: true,
      },
    });

    return NextResponse.json(schoolOwner, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du propriétaire d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du propriétaire d'école" },
      { status: 500 },
    );
  }
}
