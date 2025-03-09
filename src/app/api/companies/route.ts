import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { validateCompanyData } from '@/utils/validation/company.validation';

import { CompanyResponseDTO, CreateCompanyDTO } from '@/dto/company.dto';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse<CompanyResponseDTO[] | { error: string }>> {
  try {
    const companies = await prisma.company.findMany({
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

    const companyResponses: CompanyResponseDTO[] = companies.map((company) => ({
      id: company.id,
      name: company.name,
      logo: company.logo,
      companyOwners: company.companyOwners,
    }));

    return NextResponse.json(companyResponses);
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entreprises' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<CompanyResponseDTO | { error: string; details?: string[] }>> {
  try {
    const body = (await request.json()) as CreateCompanyDTO;

    const validationResult = await validateCompanyData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.errors,
        },
        { status: 400 },
      );
    }

    const company = await prisma.company.create({
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

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la compagnie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la compagnie' },
      { status: 500 },
    );
  }
}
