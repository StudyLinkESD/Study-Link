'use client';

import { BarChart, Users } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Statistiques',
    href: '/school',
    icon: BarChart,
  },
  {
    name: 'Liste des étudiants',
    href: '/school/students',
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <span className="text-xl font-semibold">School Dashboard</span>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7 px-6 py-4">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? 'text-primary bg-gray-50'
                        : 'hover:text-primary text-gray-700 hover:bg-gray-50',
                      'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href
                          ? 'text-primary'
                          : 'group-hover:text-primary text-gray-400',
                        'h-6 w-6 shrink-0',
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}
