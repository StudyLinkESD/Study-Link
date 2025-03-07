import Image from 'next/image';

import AuthForm from '@/components/app/loginPage/Form';

const LoginPage = () => {
  return (
    <main>
      <div className="flex flex-row">
        <div className="container mx-auto flex w-4/5 justify-center px-4 py-8">
          <div className="align-start flex w-[600px] flex-col">
            <div className="container mx-auto flex flex-col gap-4 px-4 py-8">
              <h1 className="text-3xl font-bold">Study Link</h1>
            </div>
            <AuthForm />
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

export default LoginPage;
