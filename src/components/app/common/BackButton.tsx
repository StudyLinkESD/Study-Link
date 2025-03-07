import { ArrowLeft } from 'lucide-react';

import Link from 'next/link';
import { FC } from 'react';

type BackButtonProps = {
  href: string;
  label?: string;
  className?: string;
};

const BackButton: FC<BackButtonProps> = ({ href, label = 'Retour', className = '' }) => {
  return (
    <Link
      href={href}
      className={`text-muted-foreground hover:text-foreground flex items-center text-sm ${className}`}
    >
      <ArrowLeft className="mr-1 h-4 w-4" />
      {label}
    </Link>
  );
};

export default BackButton;
