import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { validateSchoolOwnerData } from '@/utils/validation/school-owner.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';
import { PaginatedResponse } from '@/types/filters.type';

import { CreateSchoolOwnerDTO, SchoolOwnerResponseDTO } from '@/dto/school-owner.dto';
import { FilterService } from '@/services/filter.service';

/**
 * @swagger
 * /api/school-owners:
 *   get:
 *     tags:
 *       - School Owners
 *     summary: Récupère la liste des propriétaires d'écoles
 *     description: Retourne tous les propriétaires d'écoles avec leurs informations utilisateur et école
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
 *         description: Recherche sur le nom, prénom, email ou nom de l'école
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtre par ID d'école
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtre par ID d'utilisateur
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [createdAt]
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
 *         description: Liste des propriétaires d'écoles récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedSchoolOwnerResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<PaginatedResponse<SchoolOwnerResponseDTO> | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
      orderBy: searchParams.get('orderBy') || 'createdAt',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
      search: searchParams.get('search') || undefined,
      schoolId: searchParams.get('schoolId') || undefined,
      userId: searchParams.get('userId') || undefined,
    };

    const where = FilterService.buildSchoolOwnerWhereClause(filters);
    const pagination = FilterService.buildPaginationOptions(filters);

    const [schoolOwners, total] = await prisma.$transaction([
      prisma.schoolOwner.findMany({
        where,
        include: {
          user: true,
          school: {
            include: {
              domain: true,
            },
          },
        },
        ...pagination,
      }),
      prisma.schoolOwner.count({ where }),
    ]);

    return NextResponse.json({
      items: schoolOwners,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des propriétaires d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des propriétaires d'école" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/school-owners:
 *   post:
 *     tags:
 *       - School Owners
 *     summary: Crée un nouveau propriétaire d'école
 *     description: Associe un utilisateur comme propriétaire d'une école
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolOwnerDTO'
 *     responses:
 *       201:
 *         description: Propriétaire d'école créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolOwnerResponseDTO'
 *       400:
 *         description: Données invalides ou utilisateur déjà propriétaire
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Utilisateur ou école non trouvé
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
export async function POST(
  request: NextRequest,
): Promise<NextResponse<SchoolOwnerResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateSchoolOwnerDTO;

    const validationResult = await validateSchoolOwnerData(body);
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

    const [user, school] = await prisma.$transaction([
      prisma.user.findUnique({ where: { id: body.userId } }),
      prisma.school.findUnique({ where: { id: body.schoolId, deletedAt: null } }),
    ]);

    if (!user || !school) {
      return NextResponse.json({ error: "L'utilisateur ou l'école n'existe pas" }, { status: 404 });
    }

    const existingOwner = await prisma.schoolOwner.findFirst({
      where: {
        OR: [{ userId: body.userId }, { schoolId: body.schoolId }],
      },
    });

    if (existingOwner) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: [
            {
              field: 'userId',
              message:
                "Cet utilisateur est déjà propriétaire d'une école ou cette école a déjà un propriétaire",
            },
          ],
        },
        { status: 400 },
      );
    }

    const schoolOwner = await prisma.schoolOwner.create({
      data: {
        userId: body.userId,
        schoolId: body.schoolId,
      },
      include: {
        user: true,
        school: {
          include: {
            domain: true,
          },
        },
      },
    });

    return NextResponse.json(schoolOwner, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du propriétaire d'école:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du propriétaire d'école" },
      { status: 500 },
    );
  }
}
