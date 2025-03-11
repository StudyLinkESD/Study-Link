'use client';

import { Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';

import Image from 'next/image';
import { useState } from 'react';

import ProfileAvatar from '@/components/app/profileForm/ProfileAvatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

import { cn } from '@/lib/utils';

import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useNavigation } from '@/hooks/useNavigation';

import { NavLink } from './NavLink';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuthStatus();
  const { links, userRole } = useNavigation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const getProfileLink = () => {
    if (userRole === 'student' && user?.studentId) {
      return `/students/profile-info/${user.studentId}`;
    } else if (userRole === 'company' && user?.companyId) {
      return `/companies/profile/${user.companyId}`;
    }
    return null;
  };

  const profileLink = getProfileLink();

  const publicLinks = links.filter((link) => !link.requireAuth);
  const authenticatedLinks = links.filter(
    (link) => link.requireAuth && link.roles?.includes(userRole || 'student'),
  );

  return (
    <nav className="bg-background/80 fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <NavLink href="/" className="flex items-center space-x-2">
            <Image
              src="/images/main-logo.png"
              alt="StudyLink"
              width={32}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="text-xl font-bold">StudyLink</span>
          </NavLink>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {publicLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <NavLink
                        href={link.href}
                        className="hover:bg-accent rounded-md px-4 py-2 transition-colors"
                      >
                        {link.label}
                      </NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                {isAuthenticated && authenticatedLinks.length > 0 && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="h-9">
                      Espace{' '}
                      {userRole === 'student'
                        ? 'Étudiant'
                        : userRole === 'company'
                          ? 'Entreprise'
                          : 'Admin'}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul
                        className={cn(
                          'gap-3 p-4',
                          authenticatedLinks.length > 1
                            ? 'grid w-[400px] md:w-[500px] md:grid-cols-2'
                            : 'w-[350px] md:w-[500px]',
                        )}
                      >
                        {authenticatedLinks.map((link) => (
                          <li key={link.href}>
                            <NavigationMenuLink asChild>
                              <NavLink
                                href={link.href}
                                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors"
                              >
                                <div className="text-sm font-medium leading-none">{link.label}</div>
                                {link.description && (
                                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                    {link.description}
                                  </p>
                                )}
                              </NavLink>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            {isLoading ? (
              <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
            ) : isAuthenticated && user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <ProfileAvatar
                      photoUrl={user.profilePicture || user.image || undefined}
                      firstName={user.firstName || user.name?.split(' ')[0] || ''}
                      lastName={user.lastName || user.name?.split(' ').slice(-1)[0] || ''}
                      size="sm"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.name && <p className="font-medium">{user.name}</p>}
                      {user.email && (
                        <p className="text-muted-foreground w-[200px] truncate text-sm">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {profileLink && (
                    <DropdownMenuItem asChild>
                      <NavLink href={profileLink}>Voir mon profil</NavLink>
                    </DropdownMenuItem>
                  )}
                  {(userRole === 'student' || userRole === 'company') && (
                    <DropdownMenuItem asChild>
                      <NavLink
                        href={
                          userRole === 'student'
                            ? `/students/profile-info`
                            : `/companies/profile-info`
                        }
                      >
                        Gérer mon profil
                      </NavLink>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={() => signOut()}
                  >
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant={'default'} className="hover:bg-white">
                <NavLink href="/login">Se connecter</NavLink>
              </Button>
            )}
          </div>

          <button
            onClick={toggleMenu}
            className="text-muted-foreground hover:text-primary p-2 md:hidden"
            aria-label="Menu principal"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={cn(
            'md:hidden',
            'bg-background fixed inset-x-0 top-16 border-b',
            'transform transition-all duration-300 ease-in-out',
            {
              'translate-y-0 opacity-100': isOpen,
              'pointer-events-none -translate-y-full opacity-0': !isOpen,
            },
          )}
        >
          <div className="container mx-auto flex flex-col space-y-4 px-4 py-4">
            {publicLinks.map((link) => (
              <NavLink key={link.href} href={link.href} onClick={closeMenu} className="px-4 py-2">
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated && authenticatedLinks.length > 0 && (
              <>
                <div className="text-muted-foreground px-4 text-sm font-medium">
                  Espace{' '}
                  {userRole === 'student'
                    ? 'Étudiant'
                    : userRole === 'company'
                      ? 'Entreprise'
                      : 'Admin'}
                </div>
                {authenticatedLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="px-4 py-2"
                  >
                    <div className="text-sm font-medium">{link.label}</div>
                    {link.description && (
                      <p className="text-muted-foreground mt-1 text-xs">{link.description}</p>
                    )}
                  </NavLink>
                ))}
              </>
            )}

            {!isAuthenticated && (
              <Button asChild variant={'default'} className="w-full hover:bg-white">
                <NavLink href="/login" onClick={closeMenu}>
                  Se connecter
                </NavLink>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
