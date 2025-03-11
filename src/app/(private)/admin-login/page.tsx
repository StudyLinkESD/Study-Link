import Image from 'next/image';

import SchoolOwnerAuthForm from '@/components/app/loginPage/SchoolOwnerForm';

const SchoolOwnerLoginPage = () => {
  return (
    <main>
      <div className="flex flex-row">
        <div className="container mx-auto flex w-4/5 justify-center px-4 py-8">
          <div className="align-start flex w-[600px] flex-col">
            <div className="container mx-auto flex flex-col gap-4 px-4 py-8">
              <h1 className="text-3xl font-bold">Connexion Administrateur École</h1>
              <p className="text-muted-foreground">
                Connectez-vous pour accéder à votre espace de gestion d&apos;école
              </p>
            </div>
            <SchoolOwnerAuthForm />
          </div>
        </div>
        <div className="relative min-h-screen w-full">
          <Image
            src="/images/student_picture.jpg"
            alt="Students studying together"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </main>
  );
};

export default SchoolOwnerLoginPage;
