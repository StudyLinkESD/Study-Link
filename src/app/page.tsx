'use client';

import { ArrowRight, BookOpen, Briefcase, Star, Users } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useAuthStatus } from '@/hooks/useAuthStatus';

export default function HomePage() {
  const { isAuthenticated } = useAuthStatus();

  return (
    <div className="flex min-h-screen flex-col">
      <section className="relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto flex flex-col items-center px-4 py-20 md:flex-row">
          <div className="mb-10 md:mb-0 md:w-1/2 md:pr-10">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              Connectez <span className="text-primary">étudiants</span> et{' '}
              <span className="text-primary">entreprises</span> pour des opportunités d&apos;avenir
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              StudyLink simplifie la recherche de stages et d&apos;alternances en mettant en
              relation directe les étudiants qualifiés avec les entreprises à la recherche de
              talents.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={isAuthenticated ? '/jobs' : '/login'}>
                  {isAuthenticated ? 'Voir les offres' : 'Commencer maintenant'}{' '}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">Comment ça marche</Link>
              </Button>
            </div>
          </div>
          <div className="relative md:w-1/2">
            <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/images/student_picture.jpg"
                alt="Étudiants collaborant"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full text-white">
                    A
                  </div>
                  <div className="bg-secondary flex h-10 w-10 items-center justify-center rounded-full">
                    B
                  </div>
                  <div className="bg-accent flex h-10 w-10 items-center justify-center rounded-full">
                    C
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">+500 étudiants</p>
                  <p className="text-muted-foreground text-xs">ont trouvé une alternance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-gray-950" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Comment ça fonctionne</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              StudyLink connecte les étudiants et les entreprises de manière simple et efficace, en
              mettant l&apos;accent sur les compétences et la compatibilité.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Pour les étudiants</h3>
                <p className="text-muted-foreground mb-4">
                  Créez votre profil, mettez en avant vos compétences et trouvez des opportunités
                  adaptées à votre formation.
                </p>
                <Link
                  href="/login"
                  className="text-primary flex items-center font-medium hover:underline"
                >
                  Créer mon profil étudiant <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <Briefcase className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Pour les entreprises</h3>
                <p className="text-muted-foreground mb-4">
                  Publiez vos offres de stage et d&apos;alternance, découvrez des profils qualifiés
                  et contactez directement les candidats.
                </p>
                <Link
                  href="/login"
                  className="text-primary flex items-center font-medium hover:underline"
                >
                  Publier une offre <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <Users className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Pour les écoles</h3>
                <p className="text-muted-foreground mb-4">
                  Suivez le parcours de vos étudiants, collaborez avec des entreprises partenaires
                  et facilitez l&apos;insertion professionnelle.
                </p>
                <Link
                  href="/login"
                  className="text-primary flex items-center font-medium hover:underline"
                >
                  Inscrire mon établissement <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Découvrez notre plateforme</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Parcourez nos listes d&apos;étudiants talentueux et d&apos;offres d&apos;emploi
              attractives
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card className="flex flex-col items-center p-8 text-center">
              <Users className="text-primary mb-4 h-12 w-12" />
              <h3 className="mb-4 text-2xl font-bold">Explorer les profils étudiants</h3>
              <p className="text-muted-foreground mb-6">
                Parcourez notre base de données d&apos;étudiants qualifiés à la recherche de stages
                et d&apos;alternances dans divers domaines.
              </p>
              <Button size="lg" asChild>
                <Link href="/students">
                  Voir les étudiants <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            <Card className="flex flex-col items-center p-8 text-center">
              <Briefcase className="text-primary mb-4 h-12 w-12" />
              <h3 className="mb-4 text-2xl font-bold">Consulter les offres</h3>
              <p className="text-muted-foreground mb-6">
                Découvrez les dernières opportunités de stages et d&apos;alternances proposées par
                nos entreprises partenaires.
              </p>
              <Button size="lg" asChild>
                <Link href="/jobs">
                  Voir les offres <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ils nous font confiance</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Découvrez les témoignages d&apos;étudiants et d&apos;entreprises qui ont utilisé
              StudyLink pour leurs recrutements.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center">
                  <div className="mr-4">
                    <div className="bg-secondary text-secondary-foreground flex h-12 w-12 items-center justify-center rounded-full font-bold">
                      LD
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Léa Dubois</h4>
                    <p className="text-muted-foreground text-sm">
                      Étudiante en Master Développement Web
                    </p>
                  </div>
                </div>
                <div className="mb-4 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="fill-primary text-primary h-4 w-4" />
                  ))}
                </div>
                <p className="italic">
                  &quot;Grâce à StudyLink, j&apos;ai trouvé mon alternance en seulement deux
                  semaines. Le processus était simple et j&apos;ai pu mettre en avant mes
                  compétences techniques. Je recommande vivement !&quot;
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center">
                  <div className="mr-4">
                    <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full font-bold">
                      MT
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Marc Thibault</h4>
                    <p className="text-muted-foreground text-sm">Responsable RH, TechSolutions</p>
                  </div>
                </div>
                <div className="mb-4 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="fill-primary text-primary h-4 w-4" />
                  ))}
                </div>
                <p className="italic">
                  &quot;StudyLink nous a permis de trouver des profils qualifiés rapidement.
                  L&apos;interface est intuitive et le système de filtrage par compétences est
                  particulièrement efficace.&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">Prêt à commencer votre expérience ?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
            Rejoignez StudyLink dès aujourd&apos;hui et donnez un coup d&apos;accélérateur à votre
            carrière ou trouvez les talents de demain pour votre entreprise.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">
              S&apos;inscrire gratuitement <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="bg-gray-100 py-12 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">StudyLink</h3>
              <p className="text-muted-foreground">
                La plateforme de mise en relation entre étudiants et entreprises pour des stages et
                alternances.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">Liens Rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="hover:text-primary">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-primary">
                    Offres
                  </Link>
                </li>
                <li>
                  <Link href="/students" className="hover:text-primary">
                    Étudiants
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-primary">
                    Comment ça marche
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-primary">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Aide
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">Légal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-primary font-medium hover:underline">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-primary font-medium hover:underline"
                  >
                    Conditions d&apos;utilisation
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <p className="text-muted-foreground mb-4 text-sm md:mb-0">
                © {new Date().getFullYear()} StudyLink. Tous droits réservés.
              </p>
              <div className="flex space-x-6">
                <Link href="/privacy-policy" className="hover:text-primary text-sm">
                  Politique de confidentialité
                </Link>
                <Link href="/terms-of-service" className="hover:text-primary text-sm">
                  Conditions d&apos;utilisation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
