'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Briefcase, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            StudyLink
          </Link>
          <nav>
            <ul className="flex gap-6">
              <li>
                <Link href="/students" className="hover:text-primary transition-colors">
                  Étudiants
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-primary transition-colors">
                  Offres
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Connexion
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Connectez <span className="text-primary">étudiants</span> et{' '}
              <span className="text-primary">entreprises</span> pour des opportunités d&apos;avenir
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              StudyLink simplifie la recherche de stages et d&apos;alternances en mettant en
              relation directe les étudiants qualifiés avec les entreprises à la recherche de
              talents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/login">
                  Commencer maintenant <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">Comment ça marche</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/images/student_picture.jpg"
                alt="Étudiants collaborant"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                    A
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    B
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    C
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">+500 étudiants</p>
                  <p className="text-xs text-muted-foreground">ont trouvé une alternance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comment ça fonctionne</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              StudyLink connecte les étudiants et les entreprises de manière simple et efficace, en
              mettant l&apos;accent sur les compétences et la compatibilité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Pour les étudiants</h3>
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
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Briefcase className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Pour les entreprises</h3>
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
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Pour les écoles</h3>
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

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Découvrez notre plateforme</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Parcourez nos listes d&apos;étudiants talentueux et d&apos;offres d&apos;emploi
              attractives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col items-center text-center p-8">
              <Users className="text-primary h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Explorer les profils étudiants</h3>
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

            <Card className="flex flex-col items-center text-center p-8">
              <Briefcase className="text-primary h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Consulter les offres</h3>
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

      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Ils nous font confiance</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez les témoignages d&apos;étudiants et d&apos;entreprises qui ont utilisé
              StudyLink pour leurs recrutements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
                      LD
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Léa Dubois</h4>
                    <p className="text-sm text-muted-foreground">
                      Étudiante en Master Développement Web
                    </p>
                  </div>
                </div>
                <div className="mb-4 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-primary text-primary" />
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
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      MT
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Marc Thibault</h4>
                    <p className="text-sm text-muted-foreground">Responsable RH, TechSolutions</p>
                  </div>
                </div>
                <div className="mb-4 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-primary text-primary" />
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

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à commencer votre expérience ?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
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

      <footer className="bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-bold mb-4">StudyLink</h3>
              <p className="text-muted-foreground">
                La plateforme de mise en relation entre étudiants et entreprises pour des stages et
                alternances.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Liens Rapides</h3>
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
              <h3 className="text-lg font-bold mb-4">Support</h3>
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
              <h3 className="text-lg font-bold mb-4">Légal</h3>
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

          <div className="border-t pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                © {new Date().getFullYear()} StudyLink. Tous droits réservés.
              </p>
              <div className="flex space-x-6">
                <Link href="/privacy-policy" className="text-sm hover:text-primary">
                  Politique de confidentialité
                </Link>
                <Link href="/terms-of-service" className="text-sm hover:text-primary">
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
