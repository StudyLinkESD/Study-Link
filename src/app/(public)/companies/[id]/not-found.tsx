import { Building2 } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function CompanyNotFound() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="bg-muted mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <Building2 className="text-muted-foreground h-12 w-12" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Entreprise introuvable</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          L&apos;entreprise que vous recherchez n&apos;existe pas ou a été supprimée.
        </p>
        <Link href="/companies">
          <Button>Retour à la liste des entreprises</Button>
        </Link>
      </div>
    </div>
  );
}
