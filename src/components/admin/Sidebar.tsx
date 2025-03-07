'use client';

import { ArrowLeft, Building2, GraduationCap, LayoutDashboard, Users } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/schools',
      label: 'Écoles',
      icon: GraduationCap,
    },
    {
      href: '/admin/companies',
      label: 'Entreprises',
      icon: Building2,
    },
    {
      href: '/admin/users',
      label: 'Utilisateurs',
      icon: Users,
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="border-b">
        <Link
          href="/"
          className="flex items-center px-6 py-3 text-gray-700 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="mr-3 h-5 w-5" />
          Retour au site
        </Link>
      </div>
      <div className="p-4">
        <h2 className="mb-6 text-2xl font-bold">Admin</h2>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-6 py-3 text-gray-700 transition-colors hover:bg-gray-100',
                  isActive && 'bg-blue-50 text-blue-700',
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
