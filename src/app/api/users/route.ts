import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateUserCreation } from '@/utils/validation/user.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';
import { PaginatedResponse, UserFilters } from '@/types/filters.type';
import { UserType } from '@/types/user.type';

import { CreateUserDTO, EnrichedUserResponseDTO } from '@/dto/user.dto';
import { FilterService } from '@/services/filter.service';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Récupère la liste des utilisateurs
 *     description: Retourne la liste paginée des utilisateurs avec possibilité de filtrage
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
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/UserType'
 *         description: Filtrer par type d'utilisateur
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par école
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par entreprise
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher dans les noms et emails
 *       - in: query
 *         name: isProfileCompleted
 *         schema:
 *           type: boolean
 *         description: Filtrer par profil complété
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filtrer par email vérifié
 *       - in: query
 *         name: createdAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrer par date de création (après)
 *       - in: query
 *         name: createdBefore
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrer par date de création (avant)
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
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
 *         description: Liste des utilisateurs récupérée avec succès
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
  request: Request,
): Promise<NextResponse<PaginatedResponse<EnrichedUserResponseDTO> | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const filters: UserFilters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
      type: searchParams.get('type') as UserType,
      schoolId: searchParams.get('schoolId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      search: searchParams.get('search') || undefined,
      isProfileCompleted: searchParams.get('isProfileCompleted') === 'true',
      isVerified: searchParams.get('isVerified') === 'true',
      createdAfter: searchParams.get('createdAfter')
        ? new Date(searchParams.get('createdAfter')!)
        : undefined,
      createdBefore: searchParams.get('createdBefore')
        ? new Date(searchParams.get('createdBefore')!)
        : undefined,
      orderBy: searchParams.get('orderBy') || undefined,
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    };

    const where = FilterService.buildUserWhereClause(filters);
    const pagination = FilterService.buildPaginationOptions(filters);
    const include = FilterService.getDefaultUserInclude();

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        ...pagination,
        include,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      items: users as unknown as EnrichedUserResponseDTO[],
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Crée un nouvel utilisateur
 *     description: |
 *       Crée un nouvel utilisateur avec les informations fournies.
 *       Le type d'utilisateur détermine les informations supplémentaires requises.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDTO'
 *     responses:
 *       200:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnrichedUserResponseDTO'
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
  request: Request,
): Promise<NextResponse<EnrichedUserResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateUserDTO;

    const validationResult = await validateUserCreation(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const userData = {
      email: body.email.toLowerCase(),
      firstName: body.firstName,
      lastName: body.lastName,
      type: body.type,
      profilePicture: body.profilePicture,
      profileCompleted: body.profileCompleted ?? false,
    };

    const include = FilterService.getDefaultUserInclude();

    const user = await prisma.user.create({
      data: userData,
      include,
    });

    switch (body.type) {
      case UserType.COMPANY_OWNER: {
        const companyOwnerData = body as CreateUserDTO & { companyId: string };
        await prisma.companyOwner.create({
          data: {
            userId: user.id,
            companyId: companyOwnerData.companyId,
          },
        });
        break;
      }

      case UserType.STUDENT: {
        const studentData = body as CreateUserDTO & {
          schoolId: string;
          studentEmail: string;
          status: string;
          skills: string;
          apprenticeshipRhythm?: string;
          description: string;
          curriculumVitae?: string;
          previousCompanies: string;
          availability: boolean;
        };
        await prisma.student.create({
          data: {
            userId: user.id,
            schoolId: studentData.schoolId,
            studentEmail: studentData.studentEmail,
            status: studentData.status,
            skills: studentData.skills,
            apprenticeshipRhythm: studentData.apprenticeshipRhythm,
            description: studentData.description,
            curriculumVitae: studentData.curriculumVitae,
            previousCompanies: studentData.previousCompanies,
            availability: studentData.availability,
          },
        });
        break;
      }

      case UserType.SCHOOL_OWNER: {
        const schoolOwnerData = body as CreateUserDTO & { schoolId: string };
        await prisma.schoolOwner.create({
          data: {
            userId: user.id,
            schoolId: schoolOwnerData.schoolId,
          },
        });
        break;
      }

      case UserType.ADMIN: {
        await prisma.admin.create({
          data: {
            userId: user.id,
          },
        });
        break;
      }
    }

    const createdUser = await prisma.user.findUnique({
      where: { id: user.id },
      include,
    });

    return NextResponse.json(createdUser as unknown as EnrichedUserResponseDTO);
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 },
    );
  }
}
