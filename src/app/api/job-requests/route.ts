import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { UserType } from '@/types/user.type';

import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { type: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.type === UserType.STUDENT) {
      const student = await prisma.student.findFirst({
        where: {
          userId: session.user.id,
        },
      });

      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }

      const jobRequests = await prisma.jobRequest.findMany({
        where: {
          studentId: student.id,
          deletedAt: null,
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
    }

    if (user.type === UserType.COMPANY_OWNER || user.type === UserType.ADMIN) {
      const jobRequests = await prisma.jobRequest.findMany({
        where: {
          deletedAt: null,
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
    }

    return NextResponse.json(
      { error: 'You do not have permission to view job requests' },
      { status: 403 },
    );
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while fetching job requests' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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

    const existingApplication = await prisma.jobRequest.findFirst({
      where: {
        studentId: student.id,
        jobId,
      },
    });

    if (existingApplication) {
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
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 },
    );
  }
}
