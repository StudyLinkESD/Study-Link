import { Mail } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md space-y-6 px-4 text-center">
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-full p-3">
            <Mail className="text-primary h-8 w-8" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Vérifiez votre boîte mail</h1>
          <p className="text-muted-foreground">
            Un lien de connexion vous a été envoyé. Cliquez sur le lien dans l&apos;email pour vous
            connecter à votre compte.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Si vous ne trouvez pas l&apos;email, vérifiez votre dossier spam.
          </p>

          <Button variant="outline" asChild>
            <Link href="/login">Retour à la connexion</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
