import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { validateSchoolData } from '@/utils/validation/school.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';

import { SchoolResponseDTO, UpdateSchoolDTO } from '@/dto/school.dto';
import { FilterService } from '@/services/filter.service';

/**
 * @swagger
 * /api/schools/{id}:
 *   get:
 *     tags:
 *       - Schools
 *     summary: Récupère une école par son ID
 *     description: Retourne les détails d'une école spécifique
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
 *         description: École trouvée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolResponseDTO'
 *       404:
 *         description: École non trouvée
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
): Promise<NextResponse<SchoolResponseDTO | ApiError>> {
  try {
    const school = await prisma.school.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: FilterService.getDefaultSchoolInclude(),
    });

    if (!school) {
      return NextResponse.json({ error: "L'école demandée n'existe pas" }, { status: 404 });
    }

    return NextResponse.json(school as SchoolResponseDTO);
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
 *     description: Met à jour les informations d'une école existante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'école
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSchoolDTO'
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
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: École non trouvée
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
): Promise<NextResponse<SchoolResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const body = (await request.json()) as UpdateSchoolDTO;

    const validationResult = await validateSchoolData(body, true);
    if (!validationResult.isValid) {
      return NextResponse.json(validationResult, { status: 400 });
    }

    const existingSchool = await prisma.school.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existingSchool) {
      return NextResponse.json({ error: "L'école demandée n'existe pas" }, { status: 404 });
    }

    const updatedSchool = await prisma.school.update({
      where: { id: params.id },
      data: {
        name: body.name,
        logo: body.logo,
        domainId: body.domainId,
        isActive: body.isActive,
      },
      include: FilterService.getDefaultSchoolInclude(),
    });

    return NextResponse.json(updatedSchool as SchoolResponseDTO);
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
 *         description: École supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: École non trouvée
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
): Promise<NextResponse<{ success: boolean } | ApiError>> {
  try {
    const existingSchool = await prisma.school.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!existingSchool) {
      return NextResponse.json({ error: "L'école demandée n'existe pas" }, { status: 404 });
    }

    await prisma.school.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        isActive: false,
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
