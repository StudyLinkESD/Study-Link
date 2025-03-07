import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StudentResponseDTO } from '@/dto/student.dto';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse<StudentResponseDTO | { error: string }>> {
  try {
    const { userId } = await params;
    console.log("Recherche de l'étudiant pour userId:", userId);

    const student = await prisma.student.findUnique({
      where: {
        userId: userId,
      },
      include: {
        user: true,
        school: true,
      },
    });

    if (!student) {
      console.log('Aucun étudiant trouvé pour userId:', userId);
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    console.log('Étudiant trouvé:', student);

    const formattedStudent: StudentResponseDTO = {
      id: student.id,
      userId: student.userId,
      schoolId: student.schoolId,
      primaryRecommendationId: student.primaryRecommendationId || null,
      status: student.status as 'ACTIVE' | 'INACTIVE',
      skills: student.skills,
      apprenticeshipRythm: student.apprenticeshipRythm || null,
      description: student.description,
      curriculumVitae: student.curriculumVitae,
      previousCompanies: student.previousCompanies,
      availability: student.availability,
      studentEmail: student.studentEmail,
      createdAt: student.user.createdAt,
      updatedAt: student.user.updatedAt,
      user: {
        id: student.user.id,
        email: student.user.email,
        firstname: student.user.firstname,
        lastname: student.user.lastname,
        profilePicture: student.user.profilePicture || null,
      },
      school: student.school
        ? {
            id: student.school.id,
            name: student.school.name,
          }
        : null,
    };

    return NextResponse.json(formattedStudent);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'étudiant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'étudiant" },
      { status: 500 },
    );
  }
}
