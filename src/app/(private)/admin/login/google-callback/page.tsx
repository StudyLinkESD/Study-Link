'use client';

import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const GoogleCallbackPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSchoolOwner = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await axios.post('/api/auth/check-school-owner', {
            email: session.user.email,
          });

          if (response.data.isSchoolOwner) {
            router.push('/school/students');
          } else {
            toast.error("Vous n'êtes pas autorisé à accéder à cette interface. Redirection...");
            setTimeout(() => {
              router.push('/login');
            }, 2000);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du type d'utilisateur:", error);
          toast.error("Une erreur est survenue. Redirection vers la page d'accueil...");
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } finally {
          setIsChecking(false);
        }
      } else if (status === 'unauthenticated') {
        router.push('/admin/login');
        setIsChecking(false);
      }
    };

    checkSchoolOwner();
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {isChecking ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-lg">Vérification de vos droits d&apos;accès...</p>
        </div>
      ) : (
        <p className="text-lg">Redirection en cours...</p>
      )}
    </div>
  );
};

export default GoogleCallbackPage;
