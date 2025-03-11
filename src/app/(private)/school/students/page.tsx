import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';

import { columns } from './columns';
import { DataTable } from './data-table';

export default async function StudentsPage() {
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

  const schoolDomain = schoolOwner.school.domain.domain;

  const students = await prisma.student.findMany({
    where: {
      studentEmail: {
        endsWith: `@${schoolDomain}`,
      },
    },
    include: {
      user: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Liste des étudiants</h1>
        <p className="text-gray-600">
          Étudiants de l&apos;école {schoolOwner.school.name} ({schoolDomain})
        </p>
      </div>

      {students.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">Aucun étudiant trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucun étudiant avec le domaine de mail @{schoolDomain} n&apos;a été trouvé.
            </p>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={students} />
      )}
    </div>
  );
}
