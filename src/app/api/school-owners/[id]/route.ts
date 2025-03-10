import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateSchoolOwnerData } from '@/utils/validation/school-owner.validation';

import { SchoolOwnerResponseDTO, UpdateSchoolOwnerDTO } from '@/dto/school-owner.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/school-owners/{id}:
 *   get:
 *     tags:
 *       - School Owners
 *     summary: Récupère les détails d'un propriétaire d'école
 *     description: Retourne les informations détaillées d'un propriétaire d'école spécifique
 *     security:
 *       - BearerAuth: []
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
 *         description: Propriétaire d'école non trouvé
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
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<SchoolOwnerResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const schoolOwner = await prisma.schoolOwner.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        school: true,
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
 *     security:
 *       - BearerAuth: []
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
 *             $ref: '#/components/schemas/UpdateSchoolOwnerRequest'
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
 *         description: Propriétaire d'école, utilisateur ou école non trouvé
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
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<
  NextResponse<SchoolOwnerResponseDTO | { error: string; details?: Record<string, string> }>
> {
  try {
    const id = (await params).id;
    const body = (await request.json()) as UpdateSchoolOwnerDTO;

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

    const schoolOwner = await prisma.schoolOwner.update({
      where: {
        id: id,
      },
      data: {
        ...(body.userId && { userId: body.userId }),
        ...(body.schoolId && { schoolId: body.schoolId }),
      },
      include: {
        user: true,
        school: true,
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
 *     security:
 *       - BearerAuth: []
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
 *         description: Propriétaire d'école non trouvé
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
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const id = (await params).id;
    await prisma.schoolOwner.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: "Propriétaire d'école supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du propriétaire d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du propriétaire d'école" },
      { status: 500 },
    );
  }
}
