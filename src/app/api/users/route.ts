import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateUserDTO, UserResponseDTO } from '@/dto/user.dto';
import { validateUserCreation, ValidationError } from '@/utils/validation/user.validation';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<UserResponseDTO[] | { error: string }>> {
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        student: {
          include: {
            school: true,
            jobRequests: {
              include: {
                job: {
                  include: {
                    company: true,
                  },
                },
              },
            },
            recommendations: true,
          },
        },
        schoolOwner: {
          include: {
            school: {
              include: {
                domain: true,
              },
            },
          },
        },
        companyOwner: {
          include: {
            company: {
              include: {
                jobs: true,
              },
            },
          },
        },
        admin: true,
      },
    });

    const formattedUsers: UserResponseDTO[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profilePicture: user.profilePicture
        ? {
            uuid: user.profilePicture,
            fileUrl: user.profilePicture,
          }
        : null,
      student: user.student
        ? {
            id: user.student.id,
            userId: user.student.userId,
            schoolId: user.student.schoolId,
            primaryRecommendationId: user.student.primaryRecommendationId,
            status: user.student.status as 'ACTIVE' | 'INACTIVE',
            skills: user.student.skills,
            apprenticeshipRythm: user.student.apprenticeshipRythm,
            description: user.student.description,
            curriculumVitaeId: user.student.curriculumVitae,
            previousCompanies: user.student.previousCompanies,
            availability: user.student.availability,
            school: {
              id: user.student.school.id,
              name: user.student.school.name,
              domainId: user.student.school.domainId,
              logoId: user.student.school.logo,
              createdAt: user.student.school.createdAt,
              updatedAt: user.student.school.updatedAt,
              deletedAt: user.student.school.deletedAt,
            },
            curriculumVitae: user.student.curriculumVitae
              ? {
                  uuid: user.student.curriculumVitae,
                  fileUrl: user.student.curriculumVitae,
                }
              : null,
            jobRequests: user.student.jobRequests.map((request) => ({
              id: request.id,
              studentId: request.studentId,
              jobId: request.jobId,
              status: request.status,
              createdAt: request.createdAt,
              updatedAt: request.updatedAt,
              job: {
                id: request.job.id,
                name: request.job.name,
                description: request.job.description,
                skills: request.job.skills,
                createdAt: request.job.createdAt,
                updatedAt: request.job.updatedAt,
                company: {
                  id: request.job.company.id,
                  name: request.job.company.name,
                  logo: request.job.company.logo
                    ? {
                        uuid: request.job.company.logo,
                        fileUrl: request.job.company.logo,
                      }
                    : null,
                },
                featuredImage: request.job.featuredImage
                  ? {
                      uuid: request.job.featuredImage,
                      fileUrl: request.job.featuredImage,
                    }
                  : null,
              },
            })),
            recommendations: user.student.recommendations.map((rec) => ({
              id: rec.id,
              studentId: rec.studentId,
              recommenderId: rec.companyId,
              content: rec.recommendation,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          }
        : null,
      schoolOwner: user.schoolOwner
        ? {
            id: user.schoolOwner.id,
            userId: user.schoolOwner.userId,
            schoolId: user.schoolOwner.schoolId,
            school: {
              id: user.schoolOwner.school.id,
              name: user.schoolOwner.school.name,
              domain: user.schoolOwner.school.domain,
              logo: user.schoolOwner.school.logo
                ? {
                    uuid: user.schoolOwner.school.logo,
                    fileUrl: user.schoolOwner.school.logo,
                  }
                : null,
            },
          }
        : null,
      companyOwner: user.companyOwner
        ? {
            id: user.companyOwner.id,
            userId: user.companyOwner.userId,
            companyId: user.companyOwner.companyId,
            company: {
              id: user.companyOwner.company.id,
              name: user.companyOwner.company.name,
              logo: user.companyOwner.company.logo
                ? {
                    uuid: user.companyOwner.company.logo,
                    fileUrl: user.companyOwner.company.logo,
                  }
                : null,
              jobs: user.companyOwner.company.jobs,
            },
          }
        : null,
      admin: user.admin
        ? {
            id: user.admin.id,
            userId: user.admin.userId,
          }
        : null,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<UserResponseDTO | { error: string; details?: ValidationError[] }>> {
  try {
    const body = (await request.json()) as CreateUserDTO;

    const validationResult = await validateUserCreation(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase() ?? '',
        firstname: body.firstname,
        lastname: body.lastname,
        profilePicture: body.profilePicture?.fileUrl || null,
      },
    });

    if (body.type === 'company-owner') {
      await prisma.companyOwner.create({
        data: {
          userId: user.id,
          companyId: body.companyName,
        },
      });
    } else if (body.type === 'student') {
      await prisma.student.create({
        data: {
          userId: user.id,
          schoolId: body.schoolId,
          studentEmail: body.studentEmail,
          status: 'PENDING',
          skills: '',
          description: '',
          previousCompanies: '',
          availability: false,
        },
      });
    }

    const formattedUser: UserResponseDTO = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profilePicture: user.profilePicture
        ? {
            uuid: user.profilePicture,
            fileUrl: user.profilePicture,
          }
        : null,
      student: null,
      schoolOwner: null,
      companyOwner: null,
      admin: null,
    };

    return NextResponse.json(formattedUser, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 },
    );
  }
}
