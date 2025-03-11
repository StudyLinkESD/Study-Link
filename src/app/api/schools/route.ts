import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { validateSchoolData } from '@/utils/validation/school.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';
import { PaginatedResponse } from '@/types/filters.type';

import { CreateSchoolDTO, SchoolResponseDTO } from '@/dto/school.dto';
import { FilterService } from '@/services/filter.service';

/**
 * @swagger
 * /api/schools:
 *   get:
 *     tags:
 *       - Schools
 *     summary: Récupère la liste des écoles
 *     description: Retourne la liste paginée des écoles avec possibilité de filtrage
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
 *         description: Recherche sur le nom de l'école
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtre les écoles par leur état d'activation
 *       - in: query
 *         name: domainId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtre les écoles par domaine
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt]
 *           default: name
 *         description: Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Liste des écoles récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<PaginatedResponse<SchoolResponseDTO> | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
      orderBy: searchParams.get('orderBy') || 'name',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'asc',
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      domainId: searchParams.get('domainId') || undefined,
    };

    const where = FilterService.buildSchoolWhereClause(filters);
    const pagination = FilterService.buildPaginationOptions(filters);
    const include = FilterService.getDefaultSchoolInclude();

    const [schools, total] = await prisma.$transaction([
      prisma.school.findMany({
        where,
        include,
        ...pagination,
      }),
      prisma.school.count({ where }),
    ]);

    return NextResponse.json({
      items: schools as unknown as SchoolResponseDTO[],
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des écoles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des écoles' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/schools:
 *   post:
 *     tags:
 *       - Schools
 *     summary: Crée une nouvelle école
 *     description: Crée une nouvelle école avec son propriétaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolDTO'
 *     responses:
 *       201:
 *         description: École créée avec succès
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
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<SchoolResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateSchoolDTO;

    const validationResult = await validateSchoolData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(validationResult, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: body.owner.email.toLowerCase(),
          firstName: body.owner.firstName,
          lastName: body.owner.lastName,
          type: 'school_owner',
        },
      });

      const school = await tx.school.create({
        data: {
          name: body.name,
          logo: body.logo,
          domainId: body.domainId,
          isActive: true,
        },
        include: {
          domain: true,
        },
      });

      await tx.schoolOwner.create({
        data: {
          userId: user.id,
          schoolId: school.id,
        },
      });

      return school;
    });

    return NextResponse.json(result as SchoolResponseDTO, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'école:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'école" }, { status: 500 });
  }
}
