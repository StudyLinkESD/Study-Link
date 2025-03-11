import { PrismaClient } from '@prisma/client';

import { NextRequest, NextResponse } from 'next/server';

import { validateStudentData } from '@/utils/validation/student.validation';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';
import { PaginatedResponse, StudentFilters } from '@/types/filters.type';
import { StudentStatus } from '@/types/student.type';

import { CreateStudentDTO, StudentResponseDTO } from '@/dto/student.dto';
import { FilterService } from '@/services/filter.service';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/students:
 *   get:
 *     tags:
 *       - Students
 *     summary: Récupère la liste des étudiants
 *     description: Retourne la liste paginée des étudiants avec possibilité de filtrage
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
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par école
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/StudentStatus'
 *         description: Filtrer par statut
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher dans les noms, emails et compétences
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filtrer par compétences
 *       - in: query
 *         name: availability
 *         schema:
 *           type: boolean
 *         description: Filtrer par disponibilité
 *       - in: query
 *         name: apprenticeshipRhythm
 *         schema:
 *           type: string
 *         description: Filtrer par rythme d'alternance
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
 *         description: Liste des étudiants récupérée avec succès
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
): Promise<NextResponse<PaginatedResponse<StudentResponseDTO> | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const filters: StudentFilters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
      schoolId: searchParams.get('schoolId') || undefined,
      status: searchParams.get('status') as StudentStatus | undefined,
      search: searchParams.get('search') || undefined,
      skills: searchParams.get('skills')?.split(',') || undefined,
      availability: searchParams.get('availability') === 'true',
      apprenticeshipRhythm: searchParams.get('apprenticeshipRhythm') || undefined,
      orderBy: searchParams.get('orderBy') || undefined,
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    };

    const where = FilterService.buildStudentWhereClause(filters);
    const pagination = FilterService.buildPaginationOptions(filters);
    const include = FilterService.getDefaultStudentInclude();

    const [students, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        ...pagination,
        include,
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      items: students as unknown as StudentResponseDTO[],
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des étudiants' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/students:
 *   post:
 *     tags:
 *       - Students
 *     summary: Crée un nouvel étudiant
 *     description: Crée un nouvel étudiant avec les informations fournies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentDTO'
 *     responses:
 *       200:
 *         description: Étudiant créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponseDTO'
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
): Promise<NextResponse<StudentResponseDTO | ValidationErrorResponse>> {
  try {
    const data: CreateStudentDTO = await request.json();
    const validationResult = await validateStudentData(data);

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const createdStudent = await prisma.student.create({
      data: {
        userId: data.userId,
        schoolId: data.schoolId,
        studentEmail: data.studentEmail,
        status: data.status,
        skills: data.skills,
        apprenticeshipRhythm: data.apprenticeshipRhythm,
        description: data.description,
        curriculumVitae: data.curriculumVitae,
        previousCompanies: data.previousCompanies,
        availability: data.availability,
      },
      include: FilterService.getDefaultStudentInclude(),
    });

    return NextResponse.json(createdStudent as unknown as StudentResponseDTO);
  } catch (error) {
    console.error("Erreur lors de la création de l'étudiant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'étudiant" },
      { status: 500 },
    );
  }
}
