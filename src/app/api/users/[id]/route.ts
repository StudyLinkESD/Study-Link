import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UpdateUserDTO, UserResponseDTO } from '@/dto/user.dto';
import { validateUserUpdate, ValidationError } from '@/utils/validation/user.validation';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<UserResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;

    const user = await prisma.user.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        student: {
          include: {
            school: true,
            jobRequests: {
              where: { deletedAt: null },
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
                jobs: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        },
        admin: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (user.deletedAt) {
      return NextResponse.json({ error: 'Cet utilisateur a été supprimé' }, { status: 410 });
    }

    const formattedUser: UserResponseDTO = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profilePicture: user.profilePicture,
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
            curriculumVitae: user.student.curriculumVitae,
            jobRequests: user.student.jobRequests.map((request) => ({
              ...request,
              job: {
                ...request.job,
                company: {
                  ...request.job.company,
                  logo: request.job.company.logo,
                },
                featuredImage: request.job.featuredImage,
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
              logo: user.schoolOwner.school.logo,
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
              logo: user.companyOwner.company.logo,
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
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<UserResponseDTO | { error: string; details?: ValidationError[] }>> {
  try {
    const userId = (await params).id;
    const body = (await request.json()) as UpdateUserDTO;

    const validationResult = await validateUserUpdate(body, userId);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.email && { email: body.email.toLowerCase() }),
        ...(body.firstname && { firstname: body.firstname }),
        ...(body.lastname && { lastname: body.lastname }),
        ...(body.profilePicture !== undefined && {
          profilePicture: body.profilePicture || null,
        }),
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

    // Formater la réponse selon UserResponseDTO
    const formattedResponse: UserResponseDTO = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      profilePicture: updatedUser.profilePicture,
      student: updatedUser.student
        ? {
            id: updatedUser.student.id,
            userId: updatedUser.student.userId,
            schoolId: updatedUser.student.schoolId,
            primaryRecommendationId: updatedUser.student.primaryRecommendationId,
            status: updatedUser.student.status as 'ACTIVE' | 'INACTIVE',
            skills: updatedUser.student.skills,
            apprenticeshipRythm: updatedUser.student.apprenticeshipRythm,
            description: updatedUser.student.description,
            curriculumVitaeId: updatedUser.student.curriculumVitae,
            previousCompanies: updatedUser.student.previousCompanies,
            availability: updatedUser.student.availability,
            school: {
              id: updatedUser.student.school.id,
              name: updatedUser.student.school.name,
              domainId: updatedUser.student.school.domainId,
              logoId: updatedUser.student.school.logo,
              createdAt: updatedUser.student.school.createdAt,
              updatedAt: updatedUser.student.school.updatedAt,
              deletedAt: updatedUser.student.school.deletedAt,
            },
            curriculumVitae: updatedUser.student.curriculumVitae,
            jobRequests: updatedUser.student.jobRequests.map((request) => ({
              ...request,
              job: {
                ...request.job,
                company: {
                  ...request.job.company,
                  logo: request.job.company.logo,
                },
                featuredImage: request.job.featuredImage,
              },
            })),
            recommendations: updatedUser.student.recommendations.map((rec) => ({
              id: rec.id,
              studentId: rec.studentId,
              recommenderId: rec.companyId,
              content: rec.recommendation,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          }
        : null,
      schoolOwner: updatedUser.schoolOwner
        ? {
            id: updatedUser.schoolOwner.id,
            userId: updatedUser.schoolOwner.userId,
            schoolId: updatedUser.schoolOwner.schoolId,
            school: {
              id: updatedUser.schoolOwner.school.id,
              name: updatedUser.schoolOwner.school.name,
              domain: updatedUser.schoolOwner.school.domain,
              logo: updatedUser.schoolOwner.school.logo,
            },
          }
        : null,
      companyOwner: updatedUser.companyOwner
        ? {
            id: updatedUser.companyOwner.id,
            userId: updatedUser.companyOwner.userId,
            companyId: updatedUser.companyOwner.companyId,
            company: {
              id: updatedUser.companyOwner.company.id,
              name: updatedUser.companyOwner.company.name,
              logo: updatedUser.companyOwner.company.logo,
              jobs: updatedUser.companyOwner.company.jobs,
            },
          }
        : null,
      admin: updatedUser.admin
        ? {
            id: updatedUser.admin.id,
            userId: updatedUser.admin.userId,
          }
        : null,
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const id = (await params).id;

    const existingUser = await prisma.user.findUnique({
      where: { id: id },
      include: {
        student: true,
        schoolOwner: true,
        companyOwner: true,
        admin: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Transaction is used to cascade values
    // Used here to delete all information related to the user
    // If one transaction fail, other tx are not executed and a rollback is executed
    await prisma.$transaction(async (tx) => {
      if (existingUser.student) {
        await tx.recommendation.deleteMany({
          where: {
            OR: [
              { studentId: existingUser.student.id },
              { primaryForStudent: { id: existingUser.student.id } },
            ],
          },
        });

        await tx.jobRequest.deleteMany({
          where: { studentId: existingUser.student.id },
        });

        await tx.student.delete({
          where: { id: existingUser.student.id },
        });
      }

      if (existingUser.schoolOwner) {
        await tx.schoolOwner.delete({
          where: { id: existingUser.schoolOwner.id },
        });
      }

      if (existingUser.companyOwner) {
        await tx.companyOwner.delete({
          where: { id: existingUser.companyOwner.id },
        });
      }

      if (existingUser.admin) {
        await tx.admin.delete({
          where: { id: existingUser.admin.id },
        });
      }

      if (existingUser.email) {
        await tx.verificationToken.deleteMany({
          where: { identifier: existingUser.email },
        });
      }

      await tx.user.update({
        where: { id: id },
        data: {
          deletedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      message: 'Compte utilisateur et toutes les données associées supprimés avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du compte utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte utilisateur' },
      { status: 500 },
    );
  }
}
