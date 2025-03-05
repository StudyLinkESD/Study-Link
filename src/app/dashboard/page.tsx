// src/app/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  useEffect(() => {
    if (status === 'authenticated' && !isLoggedIn) {
      toast.success('Connexion réussie !');
      setIsLoggedIn(true);
    }
  }, [status, isLoggedIn]);

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
      <p>Bienvenue, {session?.user?.email}</p>
    </div>
  );
}
