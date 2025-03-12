'use client';

import axios from 'axios';
import { Briefcase, Building2, Globe, Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { useSession } from 'next-auth/react';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import BackButton from '@/components/app/common/BackButton';
import SectionCard from '@/components/app/common/SectionCard';
import StatusBadge from '@/components/app/common/StatusBadge';
import { JobCardProps } from '@/components/app/jobs/JobCard';
import JobView from '@/components/app/jobs/JobView';
import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { JobProvider, useJob } from '@/context/job.context';

function JobCardCustom(props: JobCardProps) {
  const { setSelectedJob } = useJob();
  const { offerTitle, companyName, logoUrl, status, skills, availability, description } = props;

  const handleClick = () => {
    setSelectedJob(props);
  };

  return (
    <Card
      className="cursor-pointer overflow-hidden transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            firstName={companyName}
            lastName={''}
            photoUrl={logoUrl}
            size="md"
            className="border-2 border-gray-200 dark:border-gray-700"
          />

          <div className="flex flex-col">
            <h3 className="text-md font-medium text-gray-500">{companyName}</h3>
            <h3 className="text-lg font-semibold">{offerTitle}</h3>

            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={status} />

              {availability && (
                <span className="text-muted-foreground text-xs">{availability}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="mb-2 text-sm font-medium">Compétences requises</h4>

          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 5).map((skill) => (
              <StatusBadge
                key={skill.id}
                status={skill.name}
                variant="outline"
                className="text-xs"
              />
            ))}
            {skills.length > 5 && (
              <StatusBadge status={`+${skills.length - 5}`} variant="outline" className="text-xs" />
            )}
          </div>
          <p className="mt-2 text-gray-500">◦ {description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type JobData = {
  id: string;
  title: string;
  description: string;
  status?: string;
  skills?: { id: string; name: string }[];
  availability?: string;
  createdAt?: Date;
};

type CompanyData = {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  companyOwners?: {
    userId: string;
  }[];
};

export default function CompanyPage() {
  const { data: session } = useSession();
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [jobs, setJobs] = useState<JobCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const companyResponse = await axios.get(`/api/companies/${companyId}`);

        if (!companyResponse.data) {
          return notFound();
        }

        setCompany(companyResponse.data);

        const jobsResponse = await axios.get(`/api/companies/${companyId}/jobs`);

        if (jobsResponse.data && Array.isArray(jobsResponse.data)) {
          const formattedJobs = jobsResponse.data.map((job: JobData) => {
            const jobStatus: 'Alternance' | 'Stage' =
              job.status === 'Alternance' ? 'Alternance' : 'Stage';

            return {
              id: job.id,
              offerTitle: job.title,
              companyName: companyResponse.data.name,
              logoUrl: companyResponse.data.logo || '',
              status: jobStatus,
              description: job.description,
              skills: job.skills || [],
              availability: job.availability,
            };
          });

          setJobs(formattedJobs);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Une erreur est survenue lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const isOwner =
    session?.user?.id && company?.companyOwners?.some((owner) => owner.userId === session.user.id);

  if (loading) {
    return (
      <div className="container mx-auto px-8 py-10">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-8 py-10">
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return notFound();
  }

  return (
    <JobProvider>
      <div className="container mx-auto px-8 py-10">
        <div className="mb-6">
          <BackButton href="/companies" />
        </div>

        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
                <div className="mb-4 md:mb-0">
                  {company.logo ? (
                    <div className="relative h-32 w-32">
                      <Image
                        src={company.logo}
                        alt={company.name}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted flex h-32 w-32 items-center justify-center rounded-md">
                      <Building2 className="text-muted-foreground h-16 w-16" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold">{company.name}</h1>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="text-muted-foreground h-4 w-4" />
                        <a
                          href={
                            company.website.startsWith('http')
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}

                    {company.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="text-muted-foreground h-4 w-4" />
                        <a
                          href={`mailto:${company.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {company.email}
                        </a>
                      </div>
                    )}

                    {company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="text-muted-foreground h-4 w-4" />
                        <a href={`tel:${company.phone}`} className="text-sm">
                          {company.phone}
                        </a>
                      </div>
                    )}

                    {company.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">{company.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isOwner && (
                  <div className="mt-4 md:mt-0">
                    <Link href="/companies/profile-info">
                      <Button>Modifier le profil</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="md:col-span-3">
            <SectionCard title="Offres d'emploi" icon={Briefcase}>
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCardCustom key={job.id} {...job} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Aucune offre d&apos;emploi disponible.
                </p>
              )}
            </SectionCard>
          </div>

          <div className="sticky top-20 self-start md:col-span-2">
            <JobView className="h-full" />
          </div>
        </div>
      </div>
    </JobProvider>
  );
}
