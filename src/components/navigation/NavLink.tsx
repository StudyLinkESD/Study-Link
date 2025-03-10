import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  exact?: boolean;
}

export const NavLink = ({ href, children, className, onClick, exact = true }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'hover:text-primary transition-colors',
        {
          'text-primary font-semibold': isActive,
          'text-muted-foreground': !isActive,
        },
        className,
      )}
    >
      {children}
    </Link>
  );
};
