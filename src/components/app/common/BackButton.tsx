import { FC } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type BackButtonProps = {
  href: string;
  label?: string;
  className?: string;
};

const BackButton: FC<BackButtonProps> = ({ href, label = 'Retour', className = '' }) => {
  return (
    <Link
      href={href}
      className={`flex items-center text-sm text-muted-foreground hover:text-foreground ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {label}
    </Link>
  );
};

export default BackButton;
