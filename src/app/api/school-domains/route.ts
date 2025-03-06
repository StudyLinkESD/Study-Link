import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateSchoolDomainDTO, SchoolDomainResponseDTO } from '@/dto/school-domain.dto';
import { validateSchoolDomainData } from '@/utils/validation/school-domain.validation';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<SchoolDomainResponseDTO[] | { error: string }>> {
  try {
    const domains = await prisma.authorizedSchoolDomain.findMany();
    return NextResponse.json(domains);
  } catch (error) {
    console.error('Erreur lors de la récupération des domaines:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des domaines' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<
  NextResponse<
    SchoolDomainResponseDTO | { error: string; details?: Record<string, string>; code?: string }
  >
> {
  try {
    const body = (await request.json()) as CreateSchoolDomainDTO;

    const validationResult = await validateSchoolDomainData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: validationResult.errors?.domain || 'Données invalides',
          details: validationResult.errors,
          code: validationResult.errorCode,
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
