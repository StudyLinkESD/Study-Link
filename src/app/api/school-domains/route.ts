import { Prisma } from '@prisma/client';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { validateSchoolDomainData } from '@/utils/validation/school-domain.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';
import { PaginatedResponse } from '@/types/filters.type';

import { CreateSchoolDomainDTO, SchoolDomainResponseDTO } from '@/dto/school-domain.dto';
import { FilterService } from '@/services/filter.service';

/**
 * @swagger
 * /api/school-domains:
 *   get:
 *     tags:
 *       - School Domains
 *     summary: Récupère la liste des domaines d'écoles
 *     description: Retourne tous les domaines d'écoles autorisés
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
 *         description: Recherche sur le nom de domaine
 *       - in: query
 *         name: hasSchools
 *         schema:
 *           type: boolean
 *         description: Filtre les domaines selon s'ils sont utilisés par des écoles ou non
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [domain, createdAt]
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
 *         description: Liste des domaines récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedSchoolDomainResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<PaginatedResponse<SchoolDomainResponseDTO> | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
      orderBy: searchParams.get('orderBy') || 'createdAt',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
      search: searchParams.get('search') || undefined,
      hasSchools: searchParams.get('hasSchools')
        ? searchParams.get('hasSchools') === 'true'
        : undefined,
    };

    const where = FilterService.buildSchoolDomainWhereClause(filters);
    const pagination = FilterService.buildPaginationOptions(filters);

    const [domains, total] = await prisma.$transaction([
      prisma.authorizedSchoolDomain.findMany({
        where,
        include: {
          _count: {
            select: {
              schools: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
        ...pagination,
      }),
      prisma.authorizedSchoolDomain.count({ where }),
    ]);

    return NextResponse.json({
      items: domains.map(({ _count, ...domain }) => ({
        ...domain,
        schoolCount: _count.schools,
      })),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des domaines:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des domaines' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/school-domains:
 *   post:
 *     tags:
 *       - School Domains
 *     summary: Crée un nouveau domaine d'école
 *     description: Permet d'ajouter un nouveau domaine d'école autorisé
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolDomainDTO'
 *     responses:
 *       201:
 *         description: Domaine créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolDomainResponseDTO'
 *       400:
 *         description: Données invalides ou domaine déjà existant
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
): Promise<NextResponse<SchoolDomainResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateSchoolDomainDTO;

    const validationResult = await validateSchoolDomainData(body);
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

    const existingDomain = await prisma.authorizedSchoolDomain.findFirst({
      where: {
        domain: {
          equals: body.domain,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    });

    if (existingDomain) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: [
            {
              field: 'domain',
              message: 'Ce domaine existe déjà',
            },
          ],
        },
        { status: 400 },
      );
    }

    const domain = await prisma.authorizedSchoolDomain.create({
      data: {
        domain: body.domain,
      },
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du domaine:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du domaine' }, { status: 500 });
  }
}
