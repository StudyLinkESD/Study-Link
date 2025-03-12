import { UserType } from '@/types/user.type';

import { useAuthStatus } from './useAuthStatus';

type UserRole = 'student' | 'company' | 'admin';

interface NavigationLink {
  href: string;
  label: string;
  requireAuth?: boolean;
  roles?: UserRole[];
  icon?: string;
  description?: string;
}

export const useNavigation = () => {
  const { isAuthenticated, user } = useAuthStatus();

  const userRole: UserRole | null =
    user?.type === UserType.STUDENT
      ? 'student'
      : user?.type === UserType.COMPANY_OWNER
        ? 'company'
        : user?.type === UserType.ADMIN
          ? 'admin'
          : null;

  const publicLinks: NavigationLink[] = [
    {
      href: '/',
      label: 'Accueil',
      description: "Page d'accueil de StudyLink",
    },
    {
      href: '/jobs',
      label: 'Offres',
      description: 'Découvrez toutes les offres de stage',
    },
    {
      href: '/students',
      label: 'Étudiants',
      description: 'Découvrez les profils étudiants',
    },
    {
      href: '/companies',
      label: 'Entreprises',
      description: 'Explorez les entreprises partenaires',
    },
  ];

  const studentLinks: NavigationLink[] = [
    {
      href: '/students/dashboard',
      label: 'Tableau de bord',
      requireAuth: true,
      roles: ['student'],
      description: 'Suivez vos candidatures en temps réel',
    },
  ];

  const companyLinks: NavigationLink[] = [
    {
      href: '/companies/dashboard',
      label: 'Tableau de bord',
      requireAuth: true,
      roles: ['company'],
      description: 'Gérez vos offres et candidatures reçues',
    },
  ];

  const adminLinks: NavigationLink[] = [
    {
      href: '/admin',
      label: 'Administration',
      requireAuth: true,
      roles: ['admin'],
      description: "Accédez au panneau d'administration",
    },
    {
      href: '/admin/users',
      label: 'Utilisateurs',
      requireAuth: true,
      roles: ['admin'],
      description: 'Gérez les utilisateurs de la plateforme',
    },
    {
      href: '/admin/schools',
      label: 'Écoles',
      requireAuth: true,
      roles: ['admin'],
      description: 'Gérez les écoles de la plateforme',
    },
    {
      href: '/admin/companies',
      label: 'Compagnies',
      requireAuth: true,
      roles: ['admin'],
      description: 'Gérez les compagnies de la plateforme',
    },
  ];

  const allLinks = [...publicLinks];

  if (isAuthenticated && userRole) {
    if (userRole === 'student') {
      allLinks.push(...studentLinks);
    } else if (userRole === 'company') {
      allLinks.push(...companyLinks);
    } else if (userRole === 'admin') {
      allLinks.push(...adminLinks);
    }
  }

  return {
    links: allLinks,
    userRole,
    isAdmin: userRole === 'admin',
  };
};
