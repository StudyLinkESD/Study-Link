import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UpdateCompanyDTO, CompanyResponseDTO } from '@/dto/company.dto';
import { validateCompanyData, checkCompanyExists } from '@/utils/validation/company.validation';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<CompanyResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const companyCheck = await checkCompanyExists(id);

    if (!companyCheck.exists) {
      return NextResponse.json({ error: 'Compagnie non trouvée' }, { status: 404 });
    }

    return NextResponse.json(companyCheck.company);
  } catch (error) {
    console.error('Erreur lors de la récupération de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la compagnie' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<CompanyResponseDTO | { error: string }>> {
  try {
    const id = (await params).id;
    const companyCheck = await checkCompanyExists(id);

    if (!companyCheck.exists) {
      return NextResponse.json({ error: 'Compagnie non trouvée' }, { status: 404 });
    }

    const body = (await request.json()) as UpdateCompanyDTO;

    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée fournie pour la mise à jour' },
        { status: 400 },
      );
    }

    const validationResult = await validateCompanyData(body, true);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const company = await prisma.company.update({
      where: {
        id: id,
      },
      data: body,
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la compagnie' },
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
    const companyCheck = await checkCompanyExists(id);

    if (!companyCheck.exists) {
      return NextResponse.json({ error: 'Compagnie non trouvée' }, { status: 404 });
    }

    await prisma.company.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Compagnie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la compagnie' },
      { status: 500 },
    );
  }
}
