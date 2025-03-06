import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.jobRequest.deleteMany();
  await prisma.job.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.student.deleteMany();
  await prisma.companyOwner.deleteMany();
  await prisma.schoolOwner.deleteMany();
  await prisma.company.deleteMany();
  await prisma.school.deleteMany();
  await prisma.authorizedSchoolDomain.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  const schoolLogoUrl =
    'https://png.pngtree.com/png-clipart/20211017/original/pngtree-school-logo-png-image_6851480.png';
  const companyLogoUrl =
    'https://png.pngtree.com/png-clipart/20190604/original/pngtree-creative-company-logo-png-image_1197025.jpg';
  const cvUrl = 'https://example.com/cv.pdf';

  const schoolDomain = await prisma.authorizedSchoolDomain.create({
    data: {
      domain: 'ecole-test.fr',
    },
  });

  const school = await prisma.school.create({
    data: {
      name: 'École Test',
      logo: schoolLogoUrl,
      domain: {
        connect: {
          id: schoolDomain.id,
        },
      },
    },
  });

  const company = await prisma.company.create({
    data: {
      name: 'Entreprise Test',
      logo: companyLogoUrl,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      firstname: 'Admin',
      lastname: 'Test',
      emailVerified: new Date(),
      admin: {
        create: {},
      },
    },
  });

  const schoolOwnerUser = await prisma.user.create({
    data: {
      email: 'school-owner@ecole-test.fr',
      firstname: 'Directeur',
      lastname: 'École',
      emailVerified: new Date(),
      schoolOwner: {
        create: {
          school: {
            connect: {
              id: school.id,
            },
          },
        },
      },
    },
  });

  const companyOwnerUser = await prisma.user.create({
    data: {
      email: 'company-owner@entreprise-test.fr',
      firstname: 'Manager',
      lastname: 'Entreprise',
      emailVerified: new Date(),
      companyOwner: {
        create: {
          company: {
            connect: {
              id: company.id,
            },
          },
        },
      },
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@test.com',
      firstname: 'Étudiant',
      lastname: 'Test',
      emailVerified: new Date(),
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      schoolId: school.id,
      studentEmail: 'student@ecole-test.fr',
      status: 'ACTIVE',
      skills: 'JavaScript, React, Node.js',
      apprenticeshipRythm: '3 semaines entreprise / 1 semaine école',
      description: "Étudiant motivé en recherche d'alternance",
      previousCompanies: 'Stage chez Company X',
      availability: true,
      curriculumVitae: cvUrl,
    },
  });

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      name: 'Développeur Full Stack',
      description: "Nous recherchons un développeur full stack pour un contrat d'alternance",
    },
  });

  await prisma.jobRequest.create({
    data: {
      studentId: student.id,
      jobId: job.id,
      status: 'PENDING',
    },
  });

  await prisma.recommendation.create({
    data: {
      studentId: student.id,
      companyId: company.id,
      recommendation: 'Excellent stagiaire, très motivé et compétent',
    },
  });

  console.log('Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
