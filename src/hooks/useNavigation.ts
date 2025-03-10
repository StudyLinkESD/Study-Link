import { useAuthStatus } from './useAuthStatus';

interface NavigationLink {
  href: string;
  label: string;
  requireAuth?: boolean;
  roles?: ('student' | 'company' | 'admin')[];
}

export const useNavigation = () => {
  const { isAuthenticated, user } = useAuthStatus();

  const userRole = user?.studentId ? 'student' : 'company';
  const isAdmin = false;

  const publicLinks: NavigationLink[] = [
    { href: '/', label: 'Accueil' },
    { href: '/jobs', label: 'Offres' },
    { href: '/companies', label: 'Entreprises' },
  ];

  const studentLinks: NavigationLink[] = [];

  const companyLinks: NavigationLink[] = [];

  const adminLinks: NavigationLink[] = [
    {
      href: '/admin',
      label: 'Administration',
      requireAuth: true,
      roles: ['admin'],
    },
  ];

  const allLinks = [...publicLinks];

  if (isAuthenticated) {
    if (userRole === 'student' && studentLinks.length > 0) {
      allLinks.push(...studentLinks);
    } else if (userRole === 'company' && companyLinks.length > 0) {
      allLinks.push(...companyLinks);
    }

    if (isAdmin) {
      allLinks.push(...adminLinks);
    }
  }

  return {
    links: allLinks,
    userRole,
    isAdmin,
  };
};
