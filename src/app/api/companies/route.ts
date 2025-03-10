import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateCompanyData } from '@/utils/validation/company.validation';

import { CompanyResponseDTO, CreateCompanyDTO } from '@/dto/company.dto';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/companies:
 *   get:
 *     tags:
 *       - Companies
 *     summary: Récupère la liste des entreprises
 *     description: Retourne la liste de toutes les entreprises avec leurs informations de base
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
 *         description: Liste des entreprises récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompaniesListResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(): Promise<NextResponse<CompanyResponseDTO[] | { error: string }>> {
  try {
    const companies = await prisma.company.findMany({
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

    const companyResponses: CompanyResponseDTO[] = companies.map((company) => ({
      id: company.id,
      name: company.name,
      logo: company.logo,
      companyOwners: company.companyOwners,
    }));

    return NextResponse.json(companyResponses);
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entreprises' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/companies:
 *   post:
 *     tags:
 *       - Companies
 *     summary: Crée une nouvelle entreprise
 *     description: Crée une nouvelle entreprise avec les informations fournies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompanyRequest'
 *     responses:
 *       201:
 *         description: Entreprise créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponseDTO'
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
 *                     type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(
  request: Request,
): Promise<NextResponse<CompanyResponseDTO | { error: string; details?: string[] }>> {
  try {
    const body = (await request.json()) as CreateCompanyDTO;

    const validationResult = await validateCompanyData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const company = await prisma.company.create({
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

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la compagnie' },
      { status: 500 },
    );
  }
}
