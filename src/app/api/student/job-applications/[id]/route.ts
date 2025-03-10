import { PrismaClient } from '@prisma/client';

import { NextResponse } from 'next/server';

import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Job request ID is required' }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Only students can delete job applications' },
        { status: 403 },
      );
    }

    const jobRequest = await prisma.jobRequest.findUnique({
      where: { id },
      select: { studentId: true },
    });

    if (!jobRequest) {
      return NextResponse.json({ error: 'Job request not found' }, { status: 404 });
    }

    if (jobRequest.studentId !== student.id) {
      return NextResponse.json(
        { error: 'You can only delete your own job applications' },
        { status: 403 },
      );
    }

    await prisma.jobRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 },
    );
  }
}
