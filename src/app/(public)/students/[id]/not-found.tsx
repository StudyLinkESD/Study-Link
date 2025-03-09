import { UserX } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function StudentNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="bg-muted mx-auto flex h-20 w-20 items-center justify-center rounded-full">
        <UserX className="text-muted-foreground h-10 w-10" />
      </div>

      <h2 className="mt-6 text-2xl font-semibold tracking-tight">Profil non trouvé</h2>

      <p className="text-muted-foreground mt-2">
        Désolé, le profil étudiant que vous recherchez nexiste pas ou a été supprimé.
      </p>

      <Button asChild className="mt-8">
        <Link href="/students">Retour à la liste des étudiants</Link>
      </Button>
    </div>
  );
}
