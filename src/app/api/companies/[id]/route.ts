import { PrismaClient } from '@prisma/client';

import { NextRequest, NextResponse } from 'next/server';

import { checkCompanyExists, validateCompanyData } from '@/utils/validation/company.validation';

import { CompanyResponseDTO, UpdateCompanyDTO } from '@/dto/company.dto';

const prisma = new PrismaClient();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<CompanyResponseDTO | { error: string }>> {
  try {
    const { id } = await context.params;
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        logo: true,
        companyOwners: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    const companyResponse: CompanyResponseDTO = {
      id: company.id,
      name: company.name,
      logo: company.logo,
      companyOwners: company.companyOwners,
    };

    return NextResponse.json(companyResponse);
  } catch (error) {
    console.error('Erreur lors de la récupération de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la compagnie' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<CompanyResponseDTO | { error: string }>> {
  try {
    const { id } = await context.params;
    const companyCheck = await checkCompanyExists(id);

    if (!companyCheck.exists) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
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

    const updatedCompany = await prisma.company.update({
      where: {
        id: id,
      },
      data: body,
      select: {
        id: true,
        name: true,
        logo: true,
        companyOwners: {
          select: {
            userId: true,
          },
        },
      },
    });

    const companyResponse: CompanyResponseDTO = {
      id: updatedCompany.id,
      name: updatedCompany.name,
      logo: updatedCompany.logo,
      companyOwners: updatedCompany.companyOwners,
    };

    return NextResponse.json(companyResponse);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la compagnie' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { id } = await context.params;
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
