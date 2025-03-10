import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Briefcase, Building2, Calendar, MapPin } from 'lucide-react';

import Image from 'next/image';
import { notFound } from 'next/navigation';

import { JobRequestButton } from '@/components/jobs/job-request-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { auth } from '@/auth';

const prisma = new PrismaClient();

interface JobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      company: true,
      jobRequests: {
        where: {
          deletedAt: null,
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  const session = await auth();
  const student = session?.user
    ? await prisma.student.findFirst({
        where: {
          userId: session.user.id,
        },
      })
    : null;

  const hasApplied = student
    ? job.jobRequests.some((request) => request.studentId === student.id)
    : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                {job.company.logo && (
                  <Image
                    src={job.company.logo}
                    alt={job.company.name}
                    className="h-16 w-16 object-contain"
                    width={64}
                    height={64}
                  />
                )}
                <div>
                  <CardTitle className="text-2xl">{job.name}</CardTitle>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{job.company.name}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {job.type}
                </Badge>
                {job.availability && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Disponible le{' '}
                    {format(new Date(job.availability), 'd MMMM yyyy', { locale: fr })}
                  </Badge>
                )}
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold">Description du poste</h3>
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.skills && (
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Compétences requises</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.split(',').map((skill) => (
                      <Badge key={skill.trim()} variant="outline">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Postuler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Poste à distance</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Publié le {format(job.createdAt, 'd MMMM yyyy', { locale: fr })}</span>
                </div>
                <JobRequestButton
                  jobId={job.id}
                  jobTitle={job.name}
                  companyName={job.company.name}
                  hasApplied={hasApplied}
                  isAuthenticated={!!session}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
