import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { validateSchoolOwnerData } from '@/utils/validation/school-owner.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';

import { SchoolOwnerResponseDTO, UpdateSchoolOwnerDTO } from '@/dto/school-owner.dto';

/**
 * @swagger
 * /api/school-owners/{id}:
 *   get:
 *     tags:
 *       - School Owners
 *     summary: Récupère les détails d'un propriétaire d'école
 *     description: Retourne les informations détaillées d'un propriétaire d'école spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du propriétaire d'école
 *     responses:
 *       200:
 *         description: Détails du propriétaire d'école récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolOwnerResponseDTO'
 *       404:
 *         description: Propriétaire d'école non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<SchoolOwnerResponseDTO | ApiError>> {
  try {
    const schoolOwner = await prisma.schoolOwner.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: true,
        school: {
          include: {
            domain: true,
          },
        },
      },
    });

    if (!schoolOwner) {
      return NextResponse.json({ error: "Propriétaire d'école non trouvé" }, { status: 404 });
    }

    return NextResponse.json(schoolOwner);
  } catch (error) {
    console.error("Erreur lors de la récupération du propriétaire d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du propriétaire d'école" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/school-owners/{id}:
 *   put:
 *     tags:
 *       - School Owners
 *     summary: Met à jour un propriétaire d'école
 *     description: Modifie les associations utilisateur/école d'un propriétaire d'école
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du propriétaire d'école à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSchoolOwnerDTO'
 *     responses:
 *       200:
 *         description: Propriétaire d'école mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolOwnerResponseDTO'
 *       400:
 *         description: Données invalides ou utilisateur déjà propriétaire
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Propriétaire d'école, utilisateur ou école non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<SchoolOwnerResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const body = (await request.json()) as UpdateSchoolOwnerDTO;

    const validationResult = await validateSchoolOwnerData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: Object.entries(validationResult.errors || {}).map(([field, message]) => ({
            field,
            message,
          })),
        },
        { status: 400 },
      );
    }

    const existingSchoolOwner = await prisma.schoolOwner.findUnique({
      where: { id: params.id },
    });

    if (!existingSchoolOwner) {
      return NextResponse.json({ error: "Propriétaire d'école non trouvé" }, { status: 404 });
    }

    if (body.userId || body.schoolId) {
      const existingOwner = await prisma.schoolOwner.findFirst({
        where: {
          OR: [
            { userId: body.userId || existingSchoolOwner.userId },
            { schoolId: body.schoolId || existingSchoolOwner.schoolId },
          ],
          NOT: { id: params.id },
        },
      });

      if (existingOwner) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: [
              {
                field: 'userId',
                message:
                  "Cet utilisateur est déjà propriétaire d'une école ou cette école a déjà un propriétaire",
              },
            ],
          },
          { status: 400 },
        );
      }
    }

    const schoolOwner = await prisma.schoolOwner.update({
      where: {
        id: params.id,
      },
      data: {
        ...(body.userId && { userId: body.userId }),
        ...(body.schoolId && { schoolId: body.schoolId }),
      },
      include: {
        user: true,
        school: {
          include: {
            domain: true,
          },
        },
      },
    });

    return NextResponse.json(schoolOwner);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du propriétaire d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du propriétaire d'école" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/school-owners/{id}:
 *   delete:
 *     tags:
 *       - School Owners
 *     summary: Supprime un propriétaire d'école
 *     description: Supprime l'association entre un utilisateur et une école
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du propriétaire d'école à supprimer
 *     responses:
 *       200:
 *         description: Propriétaire d'école supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Propriétaire d'école supprimé avec succès"
 *       404:
 *         description: Propriétaire d'école non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<{ message: string } | ApiError>> {
  try {
    const existingSchoolOwner = await prisma.schoolOwner.findUnique({
      where: { id: params.id },
    });

    if (!existingSchoolOwner) {
      return NextResponse.json({ error: "Propriétaire d'école non trouvé" }, { status: 404 });
    }

    await prisma.schoolOwner.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      { message: "Propriétaire d'école supprimé avec succès" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du propriétaire d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du propriétaire d'école" },
      { status: 500 },
    );
  }
}
