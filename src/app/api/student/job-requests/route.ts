import { PrismaClient } from '@prisma/client';

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Only students can view job requests' }, { status: 403 });
    }

    const jobRequests = await prisma.jobRequest.findMany({
      where: {
        studentId: student.id,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(jobRequests);
  } catch (error) {
    console.error('Error fetching job requests:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Only students can apply for jobs' }, { status: 403 });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const existingRequest = await prisma.jobRequest.findFirst({
      where: {
        studentId: student.id,
        jobId,
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
    }

    const jobRequest = await prisma.jobRequest.create({
      data: {
        studentId: student.id,
        jobId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(jobRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating job request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 },
    );
  }
}
