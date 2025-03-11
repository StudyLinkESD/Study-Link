import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { validateCompanyOwnerData } from '@/utils/validation/company-owner.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';
import { PaginatedResponse } from '@/types/filters.type';

import { CompanyOwnerResponseDTO, CreateCompanyOwnerDTO } from '@/dto/company-owner.dto';
import { FilterService } from '@/services/filter.service';

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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche sur le nom, prénom, email ou nom de l'entreprise
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: Filtrer par entreprise
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrer par utilisateur
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [createdAt, id]
 *           default: createdAt
 *         description: Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Liste des propriétaires d'entreprise récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCompanyOwnerResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<PaginatedResponse<CompanyOwnerResponseDTO> | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
      orderBy: searchParams.get('orderBy') || 'createdAt',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
      search: searchParams.get('search') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      userId: searchParams.get('userId') || undefined,
    };

    const where = FilterService.buildCompanyOwnerWhereClause(filters);
    const pagination = FilterService.buildPaginationOptions(filters);

    const [companyOwners, total] = await prisma.$transaction([
      prisma.companyOwner.findMany({
        where,
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
        ...pagination,
      }),
      prisma.companyOwner.count({ where }),
    ]);

    return NextResponse.json({
      items: companyOwners as CompanyOwnerResponseDTO[],
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    });
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
 *             $ref: '#/components/schemas/CreateCompanyOwnerDTO'
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
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<CompanyOwnerResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateCompanyOwnerDTO;

    const validationResult = await validateCompanyOwnerData(body);
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

    const companyOwner = await prisma.companyOwner.create({
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

    return NextResponse.json(companyOwner as CompanyOwnerResponseDTO, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du propriétaire d'entreprise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du propriétaire d'entreprise" },
      { status: 500 },
    );
  }
}
