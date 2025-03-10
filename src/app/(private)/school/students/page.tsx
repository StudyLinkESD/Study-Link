import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';

import { columns } from './columns';
import { DataTable } from './data-table';

export default async function StudentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    console.log('No session or user ID');
    return null;
  }

  console.log('Fetching school owner data for user:', session.user.id);

  // Récupérer le schoolOwner et ses étudiants associés
  const schoolOwner = await prisma.schoolOwner.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      school: {
        include: {
          students: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  console.log('School owner data:', schoolOwner);

  if (!schoolOwner) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Aucune école trouvée</h2>
          <p className="mt-2 text-gray-600">Vous n&apos;êtes pas associé à une école.</p>
        </div>
      </div>
    );
  }

  const students = schoolOwner.school.students;
  console.log('Students structure:', JSON.stringify(students, null, 2));
  console.log(
    'First student example:',
    students[0] ? JSON.stringify(students[0], null, 2) : 'No students',
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Liste des étudiants</h1>
        <p className="text-gray-600">Gérez les étudiants de votre école.</p>
      </div>
      <DataTable columns={columns} data={students} />
    </div>
  );
}
