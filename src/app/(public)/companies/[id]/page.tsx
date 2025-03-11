'use client';

import { Briefcase, Building2, Globe, Info, Mail, MapPin, Phone } from 'lucide-react';
import { useSession } from 'next-auth/react';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import BackButton from '@/components/app/common/BackButton';
import SectionCard from '@/components/app/common/SectionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type CompanyData = {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  jobs?: {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
  }[];
  companyOwners?: {
    userId: string;
  }[];
};

export default function CompanyPage() {
  const { data: session } = useSession();
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);

        if (!response.ok) {
          if (response.status === 404) {
            return notFound();
          }
          throw new Error("Erreur lors de la récupération des données de l'entreprise");
        }

        const data = await response.json();
        setCompany(data);
      } catch (error) {
        console.error('Erreur:', error);
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
      <div className="container mx-auto py-10">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2 border-t-2"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <BackButton href="/companies" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                {company.logo ? (
                  <div className="relative mb-4 h-32 w-32">
                    <Image
                      src={company.logo}
                      alt={company.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-muted mb-4 flex h-32 w-32 items-center justify-center rounded-md">
                    <Building2 className="text-muted-foreground h-16 w-16" />
                  </div>
                )}
                <h1 className="text-center text-2xl font-bold">{company.name}</h1>

                <div className="mt-6 w-full space-y-4">
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

                {isOwner && (
                  <div className="mt-6 w-full">
                    <Link href="/companies/profile-info">
                      <Button className="w-full">Modifier le profil</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="about">À propos</TabsTrigger>
              <TabsTrigger value="jobs">Offres d&apos;emploi</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <SectionCard title="À propos de l'entreprise" icon={Info}>
                <p className="text-sm">{company.description || 'Aucune description disponible.'}</p>
              </SectionCard>
            </TabsContent>

            <TabsContent value="jobs" className="mt-6">
              <SectionCard title="Offres d'emploi" icon={Briefcase}>
                {company.jobs && company.jobs.length > 0 ? (
                  <div className="space-y-4">
                    {company.jobs.map((job) => (
                      <Card key={job.id}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {job.description.length > 100
                              ? `${job.description.substring(0, 100)}...`
                              : job.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">
                              Publié le {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            <Link href={`/jobs/${job.id}`}>
                              <Button variant="outline" size="sm">
                                Voir l&apos;offre
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Aucune offre d&apos;emploi disponible.
                  </p>
                )}
              </SectionCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
