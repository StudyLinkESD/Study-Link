import { Building2, GraduationCap } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SelectProfilePage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Choisissez votre profil</h1>
          <p className="text-muted-foreground mt-2">
            Sélectionnez le type de profil que vous souhaitez créer
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="relative overflow-hidden transition-all hover:shadow-lg">
            <Link href="/company/profile-info" className="block h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Profil Entreprise
                </CardTitle>
                <CardDescription>
                  Créez votre profil entreprise pour publier des offres et trouver des talents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Publiez des offres de stage</li>
                  <li>• Recherchez des profils d&apos;étudiants</li>
                  <li>• Gérez vos recrutements</li>
                </ul>
                <Button className="mt-4 w-full">Créer un profil entreprise</Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="relative overflow-hidden transition-all hover:shadow-lg">
            <Link href="/src/app/(public)/students/profile-info" className="block h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" />
                  Profil Étudiant
                </CardTitle>
                <CardDescription>
                  Créez votre profil étudiant pour trouver des stages et des opportunités
                  professionnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Recherchez des stages et des emplois</li>
                  <li>• Créez votre CV en ligne</li>
                  <li>• Connectez-vous avec des entreprises</li>
                </ul>
                <Button className="mt-4 w-full">Créer un profil étudiant</Button>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
