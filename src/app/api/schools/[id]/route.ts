import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateSchoolData } from '@/utils/validation/school.validation';

import { SchoolResponseDTO, UpdateSchoolDTO } from '@/dto/school.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/schools/{id}:
 *   get:
 *     tags:
 *       - Schools
 *     summary: Récupère les détails d'une école
 *     description: Retourne les informations détaillées d'une école spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'école
 *     responses:
 *       200:
 *         description: Détails de l'école récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolResponseDTO'
 *       404:
 *         description: École non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolError'
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<SchoolResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const school = await prisma.school.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        domain: true,
      },
    });

    if (!school) {
      return NextResponse.json({ error: 'École non trouvée' }, { status: 404 });
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'école" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/schools/{id}:
 *   put:
 *     tags:
 *       - Schools
 *     summary: Met à jour une école
 *     description: Modifie les informations d'une école existante
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'école à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSchoolRequest'
 *     responses:
 *       200:
 *         description: École mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolResponseDTO'
 *       400:
 *         description: Données invalides
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
 *       404:
 *         description: École non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolError'
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<SchoolResponseDTO | { error: string; details?: Record<string, string> }>> {
  try {
    const id = (await params).id;
    const body = (await request.json()) as UpdateSchoolDTO;

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

    const school = await prisma.school.update({
      where: {
        id: id,
        deletedAt: null,
      },
      data: {
        name: body.name,
        domainId: body.domainId,
        logo: body.logo,
      },
      include: {
        domain: true,
      },
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'école" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/schools/{id}:
 *   delete:
 *     tags:
 *       - Schools
 *     summary: Supprime une école
 *     description: Marque une école comme supprimée (soft delete)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'école à supprimer
 *     responses:
 *       200:
 *         description: École supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *               example:
 *                 success: true
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
 *         description: École non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolError'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolError'
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const id = (await params).id;
    const existingSchool = await prisma.school.findUnique({
      where: { id },
    });

    if (!existingSchool) {
      return NextResponse.json({ error: 'École non trouvée' }, { status: 404 });
    }

    await prisma.school.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'école" },
      { status: 500 },
    );
  }
}
