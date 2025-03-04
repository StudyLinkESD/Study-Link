import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  School,
  BookOpen,
  Clock,
  Briefcase,
  Heart,
  Award,
  ArrowLeft,
  Mail,
  Download,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getStudentById = (id: string) => {
  const students = [
    {
      id: '1',
      firstName: 'Thomas',
      lastName: 'Dubois',
      photoUrl: '',
      email: 'thomas.dubois@ecole-dev.fr',
      status: 'Alternant' as const,
      school: 'École Supérieure de Développement Web',
      skills: [
        { id: 'react', name: 'React' },
        { id: 'javascript', name: 'JavaScript' },
        { id: 'typescript', name: 'TypeScript' },
        { id: 'nodejs', name: 'Node.js' },
        { id: 'nextjs', name: 'Next.js' },
        { id: 'tailwind', name: 'TailwindCSS' },
      ],
      alternanceRhythm: '3 semaines entreprise / 1 semaine école',
      description:
        "Passionné de développement web, je suis particulièrement intéressé par les technologies JavaScript modernes. J'ai réalisé plusieurs projets personnels et cherche une alternance pour approfondir mes connaissances.",
      cvUrl: '/cv/thomas-dubois-cv.pdf',
      availability: 'Septembre 2025',
      recommendations: [
        {
          id: 'rec1',
          authorName: 'Marie Lefevre',
          authorTitle: 'Responsable RH chez WebAgency',
          content:
            "Thomas a réalisé un stage de 2 mois dans notre entreprise. Très motivé et compétent, il s'est parfaitement intégré à l'équipe.",
        },
      ],
      experiences: [
        {
          id: 'exp1',
          company: 'WebAgency',
          position: 'Développeur Front-end (Stage)',
          startDate: 'Mai 2024',
          endDate: 'Juillet 2024',
          description:
            "Développement d'interfaces utilisateur avec React et mise en place d'une application d'administration.",
        },
      ],
    },
  ];

  return students.find((student) => student.id === id);
};

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id);

  if (!student) {
    notFound();
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href="/students"
        className="flex items-center text-sm mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour à la liste des étudiants
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                {student.photoUrl ? (
                  <AvatarImage
                    src={student.photoUrl}
                    alt={`${student.firstName} ${student.lastName}`}
                  />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {student.firstName.charAt(0)}
                    {student.lastName.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>

              <h1 className="text-xl font-bold text-center">
                {student.firstName} {student.lastName}
              </h1>

              <Badge className="mt-2">{student.status}</Badge>

              <div className="w-full mt-6 space-y-4">
                {student.school && (
                  <div className="flex items-start">
                    <School className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{student.school}</span>
                  </div>
                )}

                {student.alternanceRhythm && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{student.alternanceRhythm}</span>
                  </div>
                )}

                {student.availability && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                    <span>Disponible à partir de {student.availability}</span>
                  </div>
                )}

                {student.email && (
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="break-all">{student.email}</span>
                  </div>
                )}
              </div>

              {student.cvUrl && (
                <Button className="w-full mt-6">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le CV
                </Button>
              )}

              <Button className="w-full mt-3" variant="outline">
                Contacter
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="experience">Expérience</TabsTrigger>
              <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {student.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BookOpen className="h-5 w-5 mr-2" />À propos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{student.description}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Award className="h-5 w-5 mr-2" />
                    Compétences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Expériences professionnelles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.experiences && student.experiences.length > 0 ? (
                    <div className="space-y-6">
                      {student.experiences.map((exp) => (
                        <div key={exp.id} className="border-l-2 border-primary pl-4 pb-1">
                          <h3 className="font-semibold">{exp.position}</h3>
                          <div className="text-sm text-muted-foreground mb-2">
                            {exp.company} | {exp.startDate} - {exp.endDate || 'Présent'}
                          </div>
                          <p className="text-sm">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Aucune expérience professionnelle listée.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Heart className="h-5 w-5 mr-2" />
                    Recommandations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.recommendations && student.recommendations.length > 0 ? (
                    <div className="space-y-6">
                      {student.recommendations.map((rec) => (
                        <div key={rec.id} className="p-4 bg-muted/40 rounded-lg">
                          <p className="italic mb-4">{rec.content}</p>
                          <div className="text-sm font-medium">{rec.authorName}</div>
                          <div className="text-xs text-muted-foreground">{rec.authorTitle}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucune recommandation disponible.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
