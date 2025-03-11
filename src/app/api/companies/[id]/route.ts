import { PrismaClient } from '@prisma/client';

import { NextRequest, NextResponse } from 'next/server';

import { checkCompanyExists, validateCompanyData } from '@/utils/validation/company.validation';

import { CompanyResponseDTO, UpdateCompanyDTO } from '@/dto/company.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     tags:
 *       - Companies
 *     summary: Récupère les détails d'une entreprise spécifique
 *     description: Retourne les informations détaillées d'une entreprise en fonction de son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise
 *     responses:
 *       200:
 *         description: Détails de l'entreprise récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponseDTO'
 *       404:
 *         description: Entreprise non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<CompanyResponseDTO | { error: string }>> {
  try {
    const { id } = await context.params;
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        logo: true,
        companyOwners: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    const companyResponse: CompanyResponseDTO = {
      id: company.id,
      name: company.name,
      logo: company.logo,
      companyOwners: company.companyOwners,
    };

    return NextResponse.json(companyResponse);
  } catch (error) {
    console.error('Erreur lors de la récupération de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la compagnie' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     tags:
 *       - Companies
 *     summary: Met à jour une entreprise existante
 *     description: Met à jour les informations d'une entreprise spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCompanyRequest'
 *     responses:
 *       200:
 *         description: Entreprise mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponseDTO'
 *       400:
 *         description: Données invalides ou aucune donnée fournie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Entreprise non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<CompanyResponseDTO | { error: string }>> {
  try {
    const { id } = await context.params;
    const companyCheck = await checkCompanyExists(id);

    if (!companyCheck.exists) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    const body = (await request.json()) as UpdateCompanyDTO;

    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée fournie pour la mise à jour' },
        { status: 400 },
      );
    }

    const validationResult = await validateCompanyData(body, true);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const updatedCompany = await prisma.company.update({
      where: {
        id: id,
      },
      data: body,
      select: {
        id: true,
        name: true,
        logo: true,
        companyOwners: {
          select: {
            userId: true,
          },
        },
      },
    });

    const companyResponse: CompanyResponseDTO = {
      id: updatedCompany.id,
      name: updatedCompany.name,
      logo: updatedCompany.logo,
      companyOwners: updatedCompany.companyOwners,
    };

    return NextResponse.json(companyResponse);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la compagnie' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     tags:
 *       - Companies
 *     summary: Supprime une entreprise
 *     description: Supprime une entreprise spécifique et toutes ses données associées
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise à supprimer
 *     responses:
 *       200:
 *         description: Entreprise supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Compagnie supprimée avec succès"
 *       404:
 *         description: Entreprise non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { id } = await context.params;
    const companyCheck = await checkCompanyExists(id);

    if (!companyCheck.exists) {
      return NextResponse.json({ error: 'Compagnie non trouvée' }, { status: 404 });
    }

    await prisma.company.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Compagnie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la compagnie' },
      { status: 500 },
    );
  }
}
