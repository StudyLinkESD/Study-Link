import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { ExperienceDTO } from '@/dto/student.dto';

type ExperienceType = 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre';

function isValidExperienceType(type: string): type is ExperienceType {
  return ['Stage', 'Alternance', 'CDI', 'CDD', 'Autre'].includes(type);
}

function formatExperience(experience: {
  id: string;
  position: string;
  company: string;
  startDate: Date | null;
  endDate: Date | null;
  type: string;
  studentId: string;
}): ExperienceDTO {
  if (!isValidExperienceType(experience.type)) {
    throw new Error(`Invalid experience type: ${experience.type}`);
  }

  return {
    id: experience.id,
    position: experience.position,
    company: experience.company,
    startDate: experience.startDate?.toISOString() || '',
    endDate: experience.endDate?.toISOString(),
    type: experience.type,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ExperienceDTO[] | { error: string }>> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const experiences = await prisma.experience.findMany({
      where: {
        studentId: id,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(experiences.map(formatExperience));
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ExperienceDTO | { error: string }>> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const data = await request.json();

  if (!isValidExperienceType(data.type)) {
    return NextResponse.json({ error: `Invalid experience type: ${data.type}` }, { status: 400 });
  }

  try {
    const experience = await prisma.experience.create({
      data: {
        ...data,
        studentId: id,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json(formatExperience(experience));
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ExperienceDTO | { error: string }>> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const data = await request.json();

  if (!isValidExperienceType(data.type)) {
    return NextResponse.json({ error: `Invalid experience type: ${data.type}` }, { status: 400 });
  }

  try {
    const experience = await prisma.experience.update({
      where: {
        id: data.id,
        studentId: id,
      },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json(formatExperience(experience));
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ExperienceDTO | { error: string }>> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const data = await request.json();

  try {
    const experience = await prisma.experience.delete({
      where: {
        id: data.id,
        studentId: id,
      },
    });

    return NextResponse.json(formatExperience(experience));
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}
