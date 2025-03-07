import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SchoolDomainResponseDTO, UpdateSchoolDomainDTO } from '@/dto/school-domain.dto';
import { validateSchoolDomainData } from '@/utils/validation/school-domain.validation';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<SchoolDomainResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const domain = await prisma.authorizedSchoolDomain.findUnique({
      where: {
        id: id,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domaine non trouvé' }, { status: 404 });
    }

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Erreur lors de la récupération du domaine:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du domaine' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<
  NextResponse<SchoolDomainResponseDTO | { error: string; details?: Record<string, string> }>
> {
  try {
    const id = (await params).id;
    const body = (await request.json()) as UpdateSchoolDomainDTO;

    const validationResult = await validateSchoolDomainData(body, id);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const domain = await prisma.authorizedSchoolDomain.update({
      where: {
        id: id,
      },
      data: {
        domain: body.domain,
      },
    });

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du domaine:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du domaine' },
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
    const schoolsUsingDomain = await prisma.school.count({
      where: {
        domainId: id,
        deletedAt: null,
      },
    });

    if (schoolsUsingDomain > 0) {
      return NextResponse.json(
        {
          error: 'Ce domaine est utilisé par une ou plusieurs écoles et ne peut pas être supprimé',
        },
        { status: 400 },
      );
    }

    await prisma.authorizedSchoolDomain.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Domaine supprimé avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du domaine:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du domaine' },
      { status: 500 },
    );
  }
}
