import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import {
  checkCompanyOwnerExists,
  validateCompanyOwnerData,
} from '@/utils/validation/company-owner.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';

import { CompanyOwnerResponseDTO, UpdateCompanyOwnerDTO } from '@/dto/company-owner.dto';

/**
 * @swagger
 * /api/company-owners/{id}:
 *   get:
 *     tags:
 *       - Company Owners
 *     summary: Récupère les détails d'un propriétaire d'entreprise
 *     description: Retourne les informations détaillées d'un propriétaire d'entreprise spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du propriétaire d'entreprise
 *     responses:
 *       200:
 *         description: Détails du propriétaire d'entreprise récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyOwnerResponseDTO'
 *       404:
 *         description: Propriétaire d'entreprise non trouvé
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
): Promise<NextResponse<CompanyOwnerResponseDTO | ApiError>> {
  try {
    const { id } = params;
    const companyOwnerCheck = await checkCompanyOwnerExists(id);

    if (!companyOwnerCheck.exists) {
      return NextResponse.json({ error: "Propriétaire d'entreprise non trouvé" }, { status: 404 });
    }

    const companyOwner = await prisma.companyOwner.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!companyOwner) {
      return NextResponse.json({ error: "Propriétaire d'entreprise non trouvé" }, { status: 404 });
    }

    return NextResponse.json(companyOwner as CompanyOwnerResponseDTO);
  } catch (error) {
    console.error("Erreur lors de la récupération du propriétaire d'entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du propriétaire d'entreprise" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/company-owners/{id}:
 *   put:
 *     tags:
 *       - Company Owners
 *     summary: Met à jour un propriétaire d'entreprise
 *     description: Met à jour les informations d'un propriétaire d'entreprise spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du propriétaire d'entreprise à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCompanyOwnerDTO'
 *     responses:
 *       200:
 *         description: Propriétaire d'entreprise mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyOwnerResponseDTO'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Propriétaire d'entreprise non trouvé
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
): Promise<NextResponse<CompanyOwnerResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const { id } = params;
    const body = (await request.json()) as UpdateCompanyOwnerDTO;

    const companyOwnerCheck = await checkCompanyOwnerExists(id);
    if (!companyOwnerCheck.exists) {
      return NextResponse.json({ error: "Propriétaire d'entreprise non trouvé" }, { status: 404 });
    }

    const validationResult = await validateCompanyOwnerData(body, true, id);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          details: Object.entries(validationResult.errors || {}).map(([field, message]) => ({
            field,
            message,
          })),
        },
        { status: 400 },
      );
    }

    const companyOwner = await prisma.companyOwner.update({
      where: { id },
      data: body,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return NextResponse.json(companyOwner as CompanyOwnerResponseDTO);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du propriétaire d'entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du propriétaire d'entreprise" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/company-owners/{id}:
 *   delete:
 *     tags:
 *       - Company Owners
 *     summary: Supprime un propriétaire d'entreprise
 *     description: Supprime un propriétaire d'entreprise spécifique et ses associations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du propriétaire d'entreprise à supprimer
 *     responses:
 *       200:
 *         description: Propriétaire d'entreprise supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Propriétaire d'entreprise non trouvé
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
    const { id } = params;
    const companyOwnerCheck = await checkCompanyOwnerExists(id);

    if (!companyOwnerCheck.exists) {
      return NextResponse.json({ error: "Propriétaire d'entreprise non trouvé" }, { status: 404 });
    }

    await prisma.companyOwner.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Propriétaire d'entreprise supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du propriétaire d'entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du propriétaire d'entreprise" },
      { status: 500 },
    );
  }
}
