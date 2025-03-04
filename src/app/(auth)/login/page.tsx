import LoginForm from "@/components/app/loginPage/Form";
import Image from "next/image";

const LoginPage = () => {
  return (
    <main>
      <div className="flex flex-row">
        <div className="container flex w-4/5 justify-center mx-auto px-4 py-8">
          <div className="w-[600px] flex flex-col align-start">
            <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
              <h1 className="text-3xl font-bold">Study Link</h1>
            </div>
            <LoginForm />
          </div>
        </div>
        <div className="relative w-full min-h-screen">
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
