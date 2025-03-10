import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateCompanyOwnerData } from '@/utils/validation/company-owner.validation';
import { ValidationError } from '@/utils/validation/company-owner.validation';

import { CompanyOwnerResponseDTO, CreateCompanyOwnerDTO } from '@/dto/company-owner.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/company-owners:
 *   get:
 *     tags:
 *       - Company Owners
 *     summary: Récupère la liste des propriétaires d'entreprise
 *     description: Retourne la liste de tous les propriétaires d'entreprise avec leurs informations détaillées
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des propriétaires d'entreprise récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyOwnersListResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(): Promise<NextResponse<CompanyOwnerResponseDTO[] | { error: string }>> {
  try {
    const companyOwners = await prisma.companyOwner.findMany({
      include: {
        user: true,
        company: true,
      },
    });

    const response: CompanyOwnerResponseDTO[] = companyOwners.map((owner) => ({
      id: owner.id,
      userId: owner.userId,
      companyId: owner.companyId,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des propriétaires d'entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des propriétaires d'entreprise" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/company-owners:
 *   post:
 *     tags:
 *       - Company Owners
 *     summary: Crée un nouveau propriétaire d'entreprise
 *     description: Associe un utilisateur existant à une entreprise en tant que propriétaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompanyOwnerRequest'
 *     responses:
 *       201:
 *         description: Propriétaire d'entreprise créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyOwnerResponseDTO'
 *       400:
 *         description: Données invalides
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
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(
  request: Request,
): Promise<NextResponse<CompanyOwnerResponseDTO | { error: string; details?: ValidationError[] }>> {
  try {
    const body = (await request.json()) as CreateCompanyOwnerDTO;

    const validationResult = await validateCompanyOwnerData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const companyOwner = await prisma.companyOwner.create({
      data: body,
      include: {
        user: true,
        company: true,
      },
    });

    const response: CompanyOwnerResponseDTO = {
      id: companyOwner.id,
      userId: companyOwner.userId,
      companyId: companyOwner.companyId,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du propriétaire d'entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du propriétaire d'entreprise" },
      { status: 500 },
    );
  }
}
