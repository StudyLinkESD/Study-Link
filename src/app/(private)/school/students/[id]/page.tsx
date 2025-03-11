import { Job, JobRequest } from '@prisma/client';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BackButton from '@/components/app/common/BackButton';
import { Card, CardContent } from '@/components/ui/card';

import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';

import { StudentWithUser } from '../columns';

type StudentWithDetails = StudentWithUser & {
  jobRequests: (JobRequest & {
    job: Job & {
      company: {
        name: string;
      };
    };
  })[];
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Détails de l'étudiant | StudyLink",
  description: "Voir les détails et les candidatures d'un étudiant",
};

export default async function StudentDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Non autorisé</h2>
          <p className="mt-2 text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const schoolOwner = await prisma.schoolOwner.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      school: {
        include: {
          domain: true,
        },
      },
    },
  });

  if (!schoolOwner || !schoolOwner.school) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Aucune école trouvée</h2>
          <p className="mt-2 text-gray-600">Vous n&apos;êtes pas associé à une école.</p>
        </div>
      </div>
    );
  }

  const student = (await prisma.student.findFirst({
    where: {
      id: id,
      studentEmail: {
        endsWith: `@${schoolOwner.school.domain.domain}`,
      },
    },
    include: {
      user: true,
      jobRequests: {
        include: {
          job: {
            include: {
              company: true,
            },
          },
        },
      },
    },
  })) as StudentWithDetails | null;

  if (!student) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton href="/school/students" label="Retour à la liste" className="mb-2" />
          <h1 className="text-2xl font-semibold">Profil de l&apos;étudiant</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-xl font-semibold">Informations personnelles</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="font-medium">
                  {student.user.firstName} {student.user.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email étudiant</p>
                <p className="font-medium">{student.studentEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email personnel</p>
                <p className="font-medium">{student.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Compétences</p>
                <p className="font-medium">{student.skills}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium">{student.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Disponibilité</p>
                <p className="font-medium">
                  {student.availability ? 'Disponible' : 'Non disponible'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-xl font-semibold">Candidatures</h2>
            {student.jobRequests.length === 0 ? (
              <p className="text-gray-500">Aucune candidature pour le moment</p>
            ) : (
              <div className="space-y-4">
                {student.jobRequests.map((jobRequest) => (
                  <div
                    key={jobRequest.id}
                    className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <div className="mb-2">
                      <p className="font-medium">{jobRequest.job.name}</p>
                      <p className="text-sm text-gray-500">{jobRequest.job.company.name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Statut: <span className="font-medium">{jobRequest.status}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Postuler le:{' '}
                        <span className="font-medium">
                          {new Date(jobRequest.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
