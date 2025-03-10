'use client';

import { Building2, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

import { CompanyResponseDTO } from '@/dto/company.dto';

export default function CompaniesPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des entreprises');
        }
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2 border-t-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Entreprises</h1>
        {session && (
          <Link href="/company/profile-info">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter mon entreprise
            </Button>
          </Link>
        )}
      </div>

      {companies.length === 0 ? (
        <div className="py-10 text-center">
          <Building2 className="text-muted-foreground mx-auto h-12 w-12" />
          <h2 className="mt-4 text-lg font-semibold">Aucune entreprise</h2>
          <p className="text-muted-foreground">
            Il n&apos;y a pas encore d&apos;entreprises enregistrées.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link key={company.id} href={`/company/${company.id}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    {company.logo ? (
                      <div className="relative mb-4 h-32 w-32">
                        <Image
                          src={company.logo}
                          alt={company.name}
                          fill
                          className="rounded-lg object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-muted mb-4 flex h-32 w-32 items-center justify-center rounded-lg">
                        <Building2 className="text-muted-foreground h-12 w-12" />
                      </div>
                    )}
                    <h2 className="mb-2 text-center text-xl font-semibold">{company.name}</h2>
                  </div>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="ghost">Voir le profil</Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
