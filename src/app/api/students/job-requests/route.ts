import { PrismaClient } from '@prisma/client';
import { render } from '@react-email/render';
import { Resend } from 'resend';

import { NextRequest, NextResponse } from 'next/server';

import { ApiError, ValidationErrorResponse } from '@/types/error.type';
import { PaginatedResponse } from '@/types/filters.type';

import { auth } from '@/auth';
import { CreateJobRequestDTO, JobRequestResponseDTO } from '@/dto/job-request.dto';
import JobApplicationEmail from '@/emails/job-application';
import { FilterService } from '@/services/filter.service';

const prisma = new PrismaClient();
const resend = new Resend(process.env.AUTH_RESEND_KEY);

/**
 * @swagger
 * /api/students/job-requests:
 *   get:
 *     tags:
 *       - Students
 *     summary: Récupère les demandes d'emploi des étudiants
 *     description: Retourne la liste des demandes d'emploi avec pagination
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
 *         description: Liste des demandes d'emploi récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentJobRequestResponseDTO'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 *       500:
 *         description: Erreur serveur
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<PaginatedResponse<JobRequestResponseDTO> | ApiError>> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const student = await prisma.student.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Seuls les étudiants peuvent voir les demandes d'emploi" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';

    const pagination = FilterService.buildPaginationOptions({
      page,
      limit,
      orderBy,
      order,
    });

    const where = {
      studentId: student.id,
      deletedAt: null,
    };

    const [jobRequests, total] = await prisma.$transaction([
      prisma.jobRequest.findMany({
        where,
        ...pagination,
        include: {
          job: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
            },
          },
          student: {
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
            },
          },
        },
      }),
      prisma.jobRequest.count({ where }),
    ]);

    return NextResponse.json({
      items: jobRequests as unknown as JobRequestResponseDTO[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes d'emploi:", error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre demande' },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/students/job-requests:
 *   post:
 *     tags:
 *       - Students
 *     summary: Crée une nouvelle demande d'emploi
 *     description: Permet à un étudiant de postuler à une offre d'emploi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentJobRequestDTO'
 *     responses:
 *       201:
 *         description: Demande d'emploi créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentJobRequestResponseDTO'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentJobRequestError'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Offre d'emploi non trouvée
 *       409:
 *         description: L'étudiant a déjà postulé à cette offre
 *       500:
 *         description: Erreur serveur
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<JobRequestResponseDTO | ValidationErrorResponse | ApiError>> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const data = (await request.json()) as CreateJobRequestDTO;

    if (!data.jobId) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: [{ field: 'jobId', message: "L'ID de l'offre est requis" }],
        },
        { status: 400 },
      );
    }

    const student = await prisma.student.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Seuls les étudiants peuvent postuler aux offres' },
        { status: 403 },
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id: data.jobId,
        deletedAt: null,
      },
      include: {
        company: {
          include: {
            companyOwners: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Offre non trouvée' }, { status: 404 });
    }

    const existingRequest = await prisma.jobRequest.findFirst({
      where: {
        studentId: student.id,
        jobId: data.jobId,
        deletedAt: null,
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'Vous avez déjà postulé à cette offre' }, { status: 409 });
    }

    const jobRequest = await prisma.jobRequest.create({
      data: {
        studentId: student.id,
        jobId: data.jobId,
        status: 'PENDING',
        subject: data.subject || null,
        message: data.message || null,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    const companyOwners = job.company.companyOwners;
    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3000';
    const applicationUrl = `${baseUrl}/company/applications/${jobRequest.id}`;

    for (const owner of companyOwners) {
      const emailHtml = await render(
        JobApplicationEmail({
          companyName: job.company.name,
          jobTitle: job.name,
          studentName: `${student.user.firstName} ${student.user.lastName}`,
          studentEmail: student.user.email,
          subject: data.subject || '',
          message: data.message || '',
          applicationUrl,
        }),
      );

      await resend.emails.send({
        from: 'StudyLink <noreply@studylink.space>',
        to: owner.user.email,
        subject: `Nouvelle candidature pour: ${job.name}`,
        html: emailHtml,
      });
    }

    return NextResponse.json(jobRequest as unknown as JobRequestResponseDTO, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la demande d'emploi:", error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre demande' },
      { status: 500 },
    );
  }
}
