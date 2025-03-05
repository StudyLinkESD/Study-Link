import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <Mail className="w-8 h-8 text-primary" />
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
          <p className="text-sm text-muted-foreground">
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
